interface malloc{(byteLength: number): number}
interface free{(byteLength: number): void}

declare class FinalizationRegistry {
    constructor(cleanup: (held: Array<any>) => void);
  
    register(item: any, tag: any): void;
}

type TypedArrayConstructor = Int8ArrayConstructor|Int16ArrayConstructor|Int32ArrayConstructor|BigInt64ArrayConstructor|Uint8ArrayConstructor|Uint16ArrayConstructor|Uint32ArrayConstructor|BigUint64ArrayConstructor|Float32ArrayConstructor|Float64ArrayConstructor
type TypedArray = Int8Array|Int16Array|Int32Array|BigInt64Array|Uint8Array|Uint16Array|Uint32Array|BigUint64Array|Float32Array|Float64Array

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
  memory: WebAssembly.Memory
  malloc: malloc
  free: free
  #dataView: DataView|null
  #registry: FinalizationRegistry|null

  /**
   * Construct a memory manager.
   * @param {WebAssembly.Memory} memory The memory fro the WebAssembly instance.
   * @param {malloc} malloc Allocate memory
   * @param {free} free Free memory
   */
  constructor (memory: WebAssembly.Memory, malloc: malloc, free: free) {
    this.memory = memory
    this.malloc = malloc
    this.free = free
    this.#dataView = null
    // $FlowFixMe
    this.#registry = typeof FinalizationRegistry === 'undefined'
      ? null
      // $FlowFixMe
      : new FinalizationRegistry(addresses => {
          for (const address of addresses) {
            free(address)
          }
        })
  }

  /**
   * @property {DataView}
   */
  get dataView(): DataView {
    if (this.#dataView == null || this.#dataView.byteLength === 0) {
      this.#dataView = new DataView(this.memory.buffer)
    }
    return this.#dataView
  }

  /**
   * Free an address when finalized.
   * @param {*} target The object that will be finalized
   * @param {number} address The address to be freed
   */
  freeWhenFinalized(target: any, address: number) {
    if (this.#registry == null) {
      throw new Error('FinalizationRegistry is not implemented')
    }
    this.#registry.register(target, address)
  }

  /**
   * Create a typed array
   * @template {number|bigint} T
   * @param {TypedArrayType} typedArrayType The typed array type
   * @param {number|Array<T>} lengthOrArray Either an array to be copied or the required length
   * @returns {TypedArray} The typed array
   */
  createTypedArray (typedArrayType: TypedArrayConstructor, lengthOrArray: number|Array<any>): TypedArray {
    const length = lengthOrArray instanceof Array ? lengthOrArray.length : lengthOrArray
    const address = this.malloc(length * typedArrayType.BYTES_PER_ELEMENT)
    const typedArray = new typedArrayType(this.memory.buffer, address, length)
    if (lengthOrArray instanceof Array) {
      // @ts-ignore
      typedArray.set(lengthOrArray)
    }
    this.freeWhenFinalized(typedArray, address)
    return typedArray
  }
}
