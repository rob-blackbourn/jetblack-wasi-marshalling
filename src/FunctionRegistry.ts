import { MemoryManager } from './MemoryManager'
import { FunctionPrototype } from './types/FunctionPrototype'

interface wasmCallback{(...args: any): any;}

/**
  * A function registry
  */
export class FunctionRegistry {
  memoryManager: MemoryManager
  #registry: object

  /**
   * Construct a function registry
   * @param {MemoryManager} memoryManager The memory manager
   */
  constructor (memoryManager: MemoryManager) {
    this.memoryManager = memoryManager
    this.#registry = {}
  }

  /**
   * Register a function implied by the arguments.
   * @param {string|symbol} name The name of the function
   * @param {FunctionPrototype} prototype The function prototype
   * @param {wasmCallback} callback The wasm callback
   */
  registerImplied<TResult> (name: string|symbol, prototype: FunctionPrototype<TResult>, callback: wasmCallback): void {
    this.registerExplicit(name, prototype.mangledArgs, prototype, callback)
  }

  /**
   * Register a function with an explicit mangle.
   * @param {string|symbol} name The function name
   * @param {string} mangledArgs An explicit mangling of the function prototype
   * @param {FunctionPrototype} prototype The function prototype
   * @param {wasmCallback} callback The function to call
   */
  registerExplicit<TResult>(name: string|symbol, mangledArgs: string, prototype: FunctionPrototype<TResult>, callback: wasmCallback): void {
    if (!this.has(name)) {
      this.#registry[name] = {}
    }
    this.#registry[name][mangledArgs] = (...args) => prototype.invoke(this.memoryManager, callback, ...args)
  }

  registerUnmarshalled(name: string|symbol, callback: wasmCallback): void {
    if (!this.has(name)) {
      this.#registry[name] = {}
    }
    this.#registry[name]['*'] = callback
  }

  /**
   * Find a function which matches the arguments
   * @param {string|symbol} name The common name of the function
   * @param {Array<any>} values The arguments that will be applied to the function
   * @param {object} options Options for the mangler
   * @returns {wasmCallback|null} The wasm callback or null
   */
  findImplied (name: string|symbol, values: Array<any>, options: {}): null|wasmCallback {
    if (this.has(name)) {
      return this.findExplicit(name, FunctionPrototype.mangleValues(values, options))
    } else {
      return null
    }
  }

  /**
   * Find a function that matches the value mangle
   * @param {string|symbol} name The common name
   * @param {string} mangledValues The value mangle
   * @returns {wasmCallback|null}
   */
  findExplicit (name: string|symbol, mangledValues: string): null|wasmCallback {
    return this.#registry[name][mangledValues] || this.#registry[name]['*'] || null
  }

  /**
   * Check if a function exists.
   * @param {string|symbol} name The name of the function
   * @returns {boolean} Returns true if the function exists.
   */
  has (name: string|symbol): boolean {
    // $FlowFixMe
    return name in this.#registry
  }
}