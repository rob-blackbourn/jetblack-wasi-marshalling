import { WASI, STDOUT, STDERR } from './constants'
import { MemoryManager } from './MemoryManager'
import { FunctionRegistry } from './FunctionRegistry'
import { FunctionPrototype } from './types/FunctionPrototype'

interface writeCallback {(text: string):void}
type lengthOrArray = number|Array<any>

interface mallocCallback{(byteLength: number): number}
interface freeCallback{(address: number): void}
interface wasmCallback{(...args: any): any}

/**
 * Write
 * @callback writeCallback
 * @param {string} text 
 */

/**
 * Drain the write if a newline is in the latest test.
 * @private
 * @param {writeCallback} write A function to write a complete line
 * @param {string} prev The previous text
 * @param {string} current The latest text
 */
function drainWriter(write: writeCallback, prev: string, current: string): string {
  let text = prev + current
  while (text.includes('\n')) {
    const [line, rest] = text.split('\n', 2)
    write(line)
    text = rest
  }
  return text
}

/**
 * An implementation of WASI which supports the minimum required to memory
 * allocation, stdio and multi byte (UTF-8) characters.
 */
export class Wasi {
  env: { [key: string]: string }
  #instance: WebAssembly.Instance|null
  #memoryManager: MemoryManager|null
  #functionRegistry: FunctionRegistry|null
  #stdoutText: string
  #stderrText: string

  /**
   * Create a Wasi class
   * @param {Object.<string, string>} env The environment variables
   */
  constructor(env: { [key: string]: string }) {
    this.env = env
    
    /**
     * @property {WebAssembly.Instance} [instance] The WebAssembly instance.
     */
    this.#instance = null
    
    /**
     * @property {MemoryManager} [memoryManager] The WebAssembly memory manager
     */
    this.#memoryManager = null

    /**
     * @property {FunctionRegistry} [functionRegistry] The function registry
     */
    this.#functionRegistry = null

    /**
     * @private
     * @property {string} Text sent to stdout before a newline has een received.
     */
    this.#stdoutText = ''

    /**
     * @private
     * @property {string} Text sent to stderr before a newline has een received.
     */
    this.#stderrText = ''
  }

  get memoryManager(): MemoryManager {
    if (this.#memoryManager == null) {
      throw new Error('Not initialised')
    }
    return this.#memoryManager
  }

  set memoryManager(value: MemoryManager) {
    this.#memoryManager = value
  }

  get instance(): WebAssembly.Instance {
    if (this.#instance == null) {
      throw new Error('Not initialised')
    }
    return this.#instance
  }

  set instance(value: WebAssembly.Instance) {
    this.#instance = value
  }

  get functionRegistry(): FunctionRegistry {
    if (this.#functionRegistry == null) {
      throw new Error('Not initialised')
    }
    return this.#functionRegistry
  }

  set functionRegistry(value: FunctionRegistry) {
    this.#functionRegistry = value
  }

  /**
   * Initialize the WASI class with a WebAssembly instance.
   * @param {WebAssembly.Instance} instance A WebAssembly instance
   */
  init(instance: WebAssembly.Instance) {
    this.#instance = instance
    this.#memoryManager = new MemoryManager(
      <WebAssembly.Memory>instance.exports.memory,
      <mallocCallback>instance.exports.malloc,
      <freeCallback>instance.exports.free)
    this.#functionRegistry = new FunctionRegistry(this.memoryManager)
  }

  /**
   * Register a function
   * @param {string|symbol} name The function name
   * @param {FunctionPrototype} prototype The function prototype
   * @param {wasmCallback} callback The wasm callback
   */
  registerFunction<TResult> (name: string|symbol, prototype: FunctionPrototype<TResult>|null, callback: wasmCallback) {
    if (prototype == null) {
      this.functionRegistry.registerUnmarshalled(name, callback)
    } else {
      this.functionRegistry.registerImplied(name, prototype, callback)
    }
  }

  /**
   * Find if a function is registered
   * @param {string|symbol} name The function name
   * @returns {boolean} Returns true if the function has been registered.
   */
  hasFunction (name: string|symbol): boolean {
    return this.functionRegistry.has(name)
  }

  /**
   * Invoke a function implied by the arguments
   * @param {string|symbol} name The function name
   * @param {Array<any>} values The values with which to call the function
   * @param {object} options Name mangling options
   * @returns {*} The return value if any
   */
  invokeImpliedFunction (name: string|symbol, values: Array<any>, options: {}): any {
    const callback = this.functionRegistry.findImplied(name, values, options)
    if (callback == null) {
      throw new Error('Function not found')
    }
    return callback(...values)
  }

  /**
   * Invoke a function given an explicit argument mangle
   * @param {string|symbol} name The function name
   * @param {Array<any>} values The values with which to call the function
   * @param {string} mangledArgs The mangled arguments
   * @returns {*} The return value if any
   */
  invokeExplicitFunction(name: string|symbol, values: Array<any>, mangledArgs: string): any {
    const callback = this.functionRegistry.findExplicit(name, mangledArgs)
    if (callback == null) {
      throw new Error('Function not found')
    }
    return callback(values)
  }

  /**
   * Invoke a function with defaults
   * @param {string|symbol} name The function name
   * @param  {...any} values The function values
   * @returns {*}
   */
  invoke(name: string|symbol, ...values: any): any {
    return this.invokeImpliedFunction(name, values, {})
  }

  /**
   * Get the environment variables.
   * @param {number} environ The environment
   * @param {number} environBuf The address of the buffer
   */
  environ_get(environ: number, environBuf: number): number {
    const encoder = new TextEncoder()

    Object.entries(this.env).map(
      // $FlowFixMe
      ([key, value]) => `${key}=${value}`
    ).forEach(envVar => {
      this.memoryManager.dataView.setUint32(environ, environBuf, true)
      environ += 4

      const bytes = encoder.encode(envVar)
      const buf = new Uint8Array(this.memoryManager.memory.buffer, environBuf, bytes.length + 1)
      environBuf += buf.byteLength
    })
    return WASI.ESUCCESS
  }

  /**
   * Get the size required to store the environment variables.
   * @param {number} environCount The number of environment variables
   * @param {number} environBufSize The size of the environment variables buffer
   */
  environ_sizes_get(environCount: number, environBufSize: number): number {
    const encoder = new TextEncoder()

    const envVars = Object.entries(this.env).map(
      // $FlowFixMe
      ([key, value]) => `${key}=${value}`
    )
    const size = envVars.reduce(
      (acc, envVar) => acc + encoder.encode(envVar).byteLength + 1,
      0
    )
    this.memoryManager.dataView.setUint32(environCount, envVars.length, true)
    this.memoryManager.dataView.setUint32(environBufSize, size, true)

    return WASI.ESUCCESS
  }

  /**
   * This gets called on exit to stop the running program. We don't have
   * anything to stop!
   * @param {number} rval The return value
   */
  proc_exit(rval: number): number {
    return WASI.ESUCCESS
  }

  /**
   * Open the file descriptor
   * @param {number} fd The file descriptor
   */
  fd_close(fd: number) {
    return WASI.ESUCCESS
  }

  /**
   * Seek
   * @param {number} fd The file descriptor
   * @param {number} offset_low The low offset
   * @param {number} offset_high The high offset
   * @param {number} whence Whence
   * @param {number} newOffset The new offset
   */
  fd_seek(fd: number, offset_low: number, offset_high: number, whence: number, newOffset: number): number {
    return WASI.ESUCCESS
  }

  /**
   * Write to a file descriptor
   * @param {number} fd The file descriptor
   * @param {number} iovs The address of the scatter vector
   * @param {number} iovsLen The length of the scatter vector
   * @param {number} nwritten The number of items written
   */
  fd_write(fd: number, iovs: number, iovsLen: number, nwritten: number) {
    if (!(fd === 1 || fd === 2)) {
      return WASI.ERRNO.BADF
    }

    const buffers = Array.from({ length: iovsLen }, (_, i) => {
      const ptr = iovs + i * 8
      const buf = this.memoryManager.dataView.getUint32(ptr, true)
      const bufLen = this.memoryManager.dataView.getUint32(ptr + 4, true)
      return new Uint8Array(this.memoryManager.memory.buffer, buf, bufLen)
    })

    const textDecoder = new TextDecoder()

    let written = 0
    let text = ''
    buffers.forEach(buf => {
      text += textDecoder.decode(buf)
      written += buf.byteLength
    })
    this.memoryManager.dataView.setUint32(nwritten, written, true)

    if (fd === STDOUT) {
      this.#stdoutText = drainWriter(console.log, this.#stdoutText, text)
    } else if (fd === STDERR) {
      this.#stderrText = drainWriter(console.error, this.#stderrText, text)
    }

    return WASI.ESUCCESS
  }

  /**
   * Get the status of a file descriptor
   * @param {number} fd The file descriptor
   * @param {number} stat The status
   */
  fd_fdstat_get(fd: number, stat: number): number {
    if (!(fd === 1 || fd === 2)) {
      return WASI.ERRNO.BADF
    }
    if (this.memoryManager == null) {
      throw new Error('No memory')
    }

    this.memoryManager.dataView.setUint8(stat + 0, WASI.FILETYPE.CHARACTER_DEVICE)
    this.memoryManager.dataView.setUint32(stat + 2, WASI.FDFLAGS.APPEND, true)
    // $FlowFixMe
    this.memoryManager.dataView.setBigUint64(stat + 8, WASI.RIGHTS.FD.WRITE, true)
    // $FlowFixMe
    this.memoryManager.dataView.setBigUint64(stat + 16, WASI.RIGHTS.FD.WRITE, true)
    return WASI.ESUCCESS
  }

  imports(): {} {
    return {
      environ_get: (environ, environBuf) => this.environ_get(environ, environBuf),
      environ_sizes_get: (environCount, environBufSize) => this.environ_sizes_get(environCount, environBufSize),
      proc_exit: rval => this.proc_exit(rval),
      fd_close: fd => this.fd_close(fd),
      fd_seek: (fd, offset_low, offset_high, whence, newOffset) => this.fd_seek(fd, offset_low, offset_high, whence, newOffset),
      fd_write: (fd, iovs, iovsLen, nwritten) => this.fd_write(fd, iovs, iovsLen, nwritten),
      fd_fdstat_get: (fd, stat) => this.fd_fdstat_get(fd, stat)
    }
  }
}
