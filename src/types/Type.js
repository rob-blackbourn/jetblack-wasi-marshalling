// @flow

import type { $TypedArray, Class } from 'flow-bin'

import { MemoryManager } from '../MemoryManager'

export class Type {
  TypedArrayType: Class<$TypedArray>

  constructor (typedArrayType: Class<$TypedArray>) {
    this.TypedArrayType = typedArrayType
  }

  alloc (memoryManager: MemoryManager, array: ?any): number {
    throw new Error('Not Implemented')
  }

  free (address: number, memoryManager: MemoryManager, value: ?any): void {
    throw new Error('Not Implemented')
  }

  marshall (value: any, memoryManager: MemoryManager): number {
    throw new Error('Not Implemented')
  }

  unmarshall (address: number, memoryManager: MemoryManager, value: ?any): any {
    throw new Error('Not Implemented')
  }

  copy (dest: any, source: any): any {
  }
}
