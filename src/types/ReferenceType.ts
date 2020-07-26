import { Type } from './Type'

/**
 * A class representing a reference type
 * @template T
 * @extends {Type<T>}
 */
export abstract class ReferenceType<T> extends Type<T> {
}
