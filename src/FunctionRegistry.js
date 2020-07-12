import { MemoryManager } from './MemoryManager'
import { FunctionPrototype } from './types/FunctionPrototype'

// @filename: types.d.ts

 /**
  * A function registry
  */
export class FunctionRegistry {
  /**
   * Construct a function registry
   * @param {MemoryManager} memoryManager The memory manager
   */
  constructor (memoryManager) {
    this.memoryManager = memoryManager
    this._registry = {}
  }

  /**
   * 
   * @param {string|symbol} name The name of the function
   * @param {FunctionPrototype} prototype The function prototype
   * @param {wasmCallback} callback The wasm callback
   */
  registerImplied (name, prototype, callback) {
    this.registerExplicit(name, prototype.mangledArgs, prototype, callback)
  }

  registerExplicit(name, mangledArgs, prototype, callback) {
    if (!(name in this._registry)) {
      this._registry[name] = {}
    }
    this._registry[name][mangledArgs] = (...args) => prototype.invoke(this.memoryManager, callback, ...args)
  }

  /**
   * Find a function which matches the arguments
   * @param {string|symbol} name The common name of the function
   * @param {Array<any>} values The arguments that will be applied to the function
   * @param {object} options Options for the mangler
   * @returns {wasmCallback|null} The wasm callback or null
   */
  findImplied (name, values, options) {
    if (name in this._registry) {
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
  findExplicit (name, mangledValues) {
    return this._registry[name][mangledValues] || null
  }
}