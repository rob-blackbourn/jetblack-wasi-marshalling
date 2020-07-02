/**
 * Allocate memory
 * @callback malloc
 * @param {number} byteLength The number of bytes to allocate
 * @returns {number} The address of the allocatred memory
 */

 /**
  * Free allocated memory
  * @callback free
  * @param {number} address The address of the allocated memory
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
  }

  /**
   * @poperty {DataView}
   */
  get dataView() {
    return new DataView(this.memory.buffer)
  }
}
