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
}
