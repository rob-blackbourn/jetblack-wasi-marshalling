import { Type } from './Type'
import { MemoryManager } from '..'

/**
 * A class representing no value
 */
export class VoidType extends Type<void> {
  alloc(memoryManager: MemoryManager, unmarshalledIndex: number, unmarshalledArgs: any[]): number {
    throw new Error("Method not implemented.")
  }
  
  free(memoryManager: MemoryManager, address: number, unmarshalledIndex: number, unmarshalledArgs: any[]): void {
    throw new Error("Method not implemented.")
  }
  
  marshall(memoryManager: MemoryManager, unmarshalledIndex: number, unmarshalledArgs: any[]): number {
    throw new Error("Method not implemented.")
  }
  
  unmarshall(memoryManager: MemoryManager, address: number, unmarshalledIndex: number, unmarshalledArgs: any[]): void {
    throw new Error("Method not implemented.")
  }
  
  copy(dest: void, source: void): void {
    throw new Error("Method not implemented.")
  }

  static MANGLED_NAME = 'v0'

  get mangledName(): string {
    return VoidType.MANGLED_NAME
  }
}