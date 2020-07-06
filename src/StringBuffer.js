import { MemoryManager } from './MemoryManager'

/**
 * Find the length of a null terminated string.
 * @param {MemoryManager} memoryManager The memory manager.
 * @param {number} address The address of the string in memory.
 * @returns {number} The length of the string.
 */
function strlen(memoryManager, address) {
  const buf = new Uint8Array(memoryManager.memory.buffer, address)
  let i = 0
  while (buf[i] !== 0) {
    ++i
  }
  return i
}

/**
 * A styped array representing a string.
 */
export class StringBuffer extends Uint8Array {
  /**
   * Create a string buffer from a string.
   * @param {MemoryManager} memoryManager The memory manager
   * @param {string} string The string to encode
   * @param {boolean} finalize If true free the memory through finalization.
   * @returns {StringBuffer} The created string buffer.
   */
  static fromString(memoryManager, string, finalize) {
    // Encode the string in utf-8.
    const encoder = new TextEncoder()
    const encodedString = encoder.encode(string)

    // Copy the string into memory allocated in the WebAssembly adding one
    // character for the null byte.
    const address = memoryManager.malloc(encodedString.byteLength + 1)
    const buf = new StringBuffer(
      memoryManager.memory.buffer,
      address,
      encodedString.byteLength + 1)
    buf.set(encodedString)

    if (finalize) {
      memoryManager.registry.register(buf, address)
    }

    return buf
  }

  /**
   * Create a string buffer from an address.
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} address The address of the string
   * @param {boolean} finalize If true register the string buffer for finalization.
   * @returns {StringBuffer} The created string buffer.
   */
  static fromAddress (memoryManager, address, finalize) {
    let length = strlen(memoryManager, address)
    const array = new StringBuffer(memoryManager.memory.buffer, address, length)
    if (finalize) {
      memoryManager.registry.register(array, address)
    }
    return array
  }

  /**
   * Decode the string buffer to a string
   * @returns {string}
   */
  toString () {
    const decoder = new TextDecoder()
    const string = decoder.decode(this)
    return string
  }
}