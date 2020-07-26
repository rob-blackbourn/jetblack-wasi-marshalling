/**
 * A pointer
 * @template T
 */
export class Pointer<T> {
  contents: T

  /**
   * Construct a pointer.
   * @param {T} contents The contents of the pointer
   */
  constructor (contents: T) {
    this.contents = contents
  }
}
