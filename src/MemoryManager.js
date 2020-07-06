// @filename: types.d.ts

/**
 * TypedArayType
 * @typedef {Int8ArrayConstructor|Int16ArrayConstructor|Int32ArrayConstructor|BigInt64ArrayConstructor|Uint8ArrayConstructor|Uint16ArrayConstructor|Uint32ArrayConstructor|BigUint64ArrayConstructor|Float32ArrayConstructor|Float64ArrayConstructor} TypedArrayType
 */

/**
 * The memory manager
 */
export class MemoryManager {
  /**
   * Construct a memory manager.
   * @param {WebAssembly.Memory} memory The memory fro the WebAssembly instance.
   * @param {malloc} malloc Allocate memory
   * @param {free} free Free memory
   */
  constructor (memory, malloc, free) {
    this.memory = memory
    this.malloc = malloc
    this.free = free
    this._dataView = null
    this._registry = typeof FinalizationRegistry === 'undefined'
      ? null
      : new FinalizationRegistry(addresses => {
          for (const address of addresses) {
            free(address)
          }
        })
  }

  /**
   * @poperty {DataView}
   */
  get dataView() {
    if (this._dataView == null || this._dataView.byteLength === 0) {
      this._dataView = new DataView(this.memory.buffer)
    }
    return this._dataView
  }

  /**
   * @property {FinalizationRegistry}
   */
  get registry() {
    if (this._registry === null) {
      throw new Error('FinalizationRegistry is not implemented')
    }
    return this._registry
  }

  /**
   * Create a typed array
   * @template {number|bigint} T
   * @param {TypedArrayType} typedArrayType The typed array type
   * @param {number|Array<T>} lengthOrArray Either an array to be copied or the required length
   * @returns {TypedArray} The typed array
   */
  createTypedArray (typedArrayType, lengthOrArray) {
    const length = lengthOrArray instanceof Array ? lengthOrArray.length : lengthOrArray
    const address = this.malloc(length * typedArrayType.BYTES_PER_ELEMENT)
    const typedArray = new typedArrayType(this.memory.buffer, address, length)
    if (lengthOrArray instanceof Array) {
      // @ts-ignore
      typedArray.set(lengthOrArray)
    }
    this.registry.register(typedArray, address)
    return typedArray
  }

  /**
   * Marshall a string
   * @param {string} string The string to marshall
   * @param {boolean} finalize If true add to the finalizer registry
   * @returns {number} The address of a the string.
   */
  marshallString (string, finalize) {
    // Encode the string in utf-8.
    const encoder = new TextEncoder()
    const encodedString = encoder.encode(string)
    // Copy the string into memory allocated in the WebAssembly
    const address = this.malloc(encodedString.byteLength + 1)
    const buf = new Uint8Array(this.memory.buffer, address, encodedString.byteLength + 1)
    buf.set(encodedString)
    if (finalize) {
      this.registry.register(buf, address)
    }
    return address
  }

  /**
   * Unmarshall a string
   * @param {number} address The address of the string
   * @param {boolean} finalize If true add to the finalizer registry
   * @returns {string} The unmarshalled string
   */
  unmarshallString (address, finalize) {
    // Find the number of bytes before the null termination character.
    const buf = new Uint8Array(this.memory.buffer, address)
    let length = 0
    while (buf[length] !== 0) {
      ++length
    }
    // Decode the string
    const array = new Uint8Array(this.memory.buffer, address, length)
    const decoder = new TextDecoder()
    const string = decoder.decode(array)
    if (finalize) {
      this.registry.register(string, address)
    }
    return string
  }

}
