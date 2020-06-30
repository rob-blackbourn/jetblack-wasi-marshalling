// @flow

import type { $TypedArray, Class } from 'flow-bin'

import { MemoryManager } from '../MemoryManager'

export class Type {
  TypedArrayType: Class<$TypedArray>

  constructor (typedArrayType: Class<$TypedArray>) {
    this.TypedArrayType = typedArrayType
  }

  free (address: number, memoryManager: MemoryManager): void {
    throw new Error('Not Implemented')
  }

  marshall (value: any, memoryManager: MemoryManager): number {
    throw new Error('Not Implemented')
  }

  unmarshall (address: number, memoryManager: MemoryManager): any {
    throw new Error('Not Implemented')
  }
}
