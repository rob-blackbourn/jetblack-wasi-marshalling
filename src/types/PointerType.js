import { Pointer } from './Pointer'
import { ReferenceType } from './ReferenceType'

export class PointerType extends ReferenceType {
  constructor (type) {
    super()
    this.type = type
  }

  free (address, memoryManager) {
    try {
      const marshalledAddress = memoryManager.dataView.getUint32(address)
      this.type.free(marshalledAddress, memoryManager)
    } finally {
      memoryManager.free(address)
    }
  }

  alloc (memoryManager) {
    const address = memoryManager.malloc(Uint32Array.BYTES_PER_ELEMENT)
    return address
  }

  marshall (value, memoryManager) {
    const address = this.alloc(memoryManager)
    const marshalledAddress = this.type.marshall(value.contents, memoryManager)
    memoryManager.dataView.setUint32(address, marshalledAddress)
    return address
  }

  unmarshall (address, memoryManager) {
    try {
      const marshalledAddress = memoryManager.dataView.getUint32(address)
      return new Pointer(this.type.unmarshall(marshalledAddress, memoryManager))
    } finally {
      memoryManager.free(address)
    }
  }

  copy (dest, source) {
    dest.contents = source.contents
    return dest
  }
}
