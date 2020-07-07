// @filename: types.d.ts

/**
 * TypedArrayType
 * @typedef {Int8ArrayConstructor|Int16ArrayConstructor|Int32ArrayConstructor|BigInt64ArrayConstructor|Uint8ArrayConstructor|Uint16ArrayConstructor|Uint32ArrayConstructor|BigUint64ArrayConstructor|Float32ArrayConstructor|Float64ArrayConstructor} TypedArrayType
 */

 /**
 * TypedArray
 * @typedef {Int8Array|Int16Array|Int32Array|BigInt64Array|Uint8Array|Uint16Array|Uint32Array|BigUint64Array|Float32Array|Float64Array} TypedArray
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
   * Free an address when finalized.
   * @param {*} target The object that will be finalized
   * @param {number} address The address to be freed
   */
  freeWhenFinalized(target, address) {
    if (this._registry === null) {
      throw new Error('FinalizationRegistry is not implemented')
    }
    this._registry.register(target, address)
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
}
