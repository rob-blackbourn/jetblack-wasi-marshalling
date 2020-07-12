import { FunctionPrototype } from './types/FunctionPrototype'

/**
 * WASM Callback
 * @callback wasmCallback
 * @param {...*} args The function arguments
 * @returns {*} The function result.
 */

 /**
  * A function registry
  */
export class FunctionRegistry {
  /**
   * Construct a function registry
   */
  constructor () {
    this._registry = {}
  }

  /**
   * 
   * @param {string|symbol} name The name of the function
   * @param {FunctionPrototype} prototype The function prototype
   * @param {wasmCallback} callback The wasm callback
   */
  register (name, prototype, callback) {
    if (!(name in this._registry)) {
      this._registry[name] = {}
    }
    this._registry[name][prototype.mangledArgs] = callback
  }

  /**
   * Find a function which matches the arguments
   * @param {string|symbol} name The common name of the function
   * @param {Array<any>} values The arguments that will be applied to the function
   * @param {object} options Options for the mangler
   * @returns {wasmCallback|null} The wasm callback or null
   */
  match (name, values, options) {
    if (name in this._registry) {
      return this.find(name, FunctionPrototype.mangleValues(values, options))
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
  find (name, mangledValues) {
    return this._registry[name][mangledValues] || null
  }
}