import { Type } from './Type'

export class ValueType extends Type {
  alloc (memoryManager) {
    return memoryManager.malloc(this.TypedArrayType.BYTES_PER_ELEMENT)
  }

  free (address, memoryManager) {
    memoryManager.free(address)
  }
}
