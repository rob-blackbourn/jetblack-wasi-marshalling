import { ReferenceType } from './ReferenceType'

export class ArrayType extends ReferenceType {
  constructor (type, length) {
    super()
    this.type = type
    this.length = length
  }

  alloc (memoryManager, array) {
    if (this.length != null && array != null && this.length !== array.length) {
      throw new RangeError('Invalid array length')
    }

    const length = array != null ? array.length : this.length
    if (length == null) {
      throw new RangeError('Unknown length')
    }
    return memoryManager.malloc(length * this.type.TypedArrayType.BYTES_PER_ELEMENT)
  }

  free (address, memoryManager, value) {
    try {
      const length = this.length || value.length
      if (this.type instanceof ReferenceType) {
        const typedArray = new this.type.TypedArrayType(memoryManager.memory.buffer, address, length)
        typedArray.forEach(item => this.type.free(item))
      }
    } finally {
      memoryManager.free(address)
    }
  }

  marshall (array, memoryManager) {
    const address = this.alloc(memoryManager, array)

    if (this.type instanceof ReferenceType) {
      const typedArray = new Uint32Array(memoryManager.memory.buffer, address, array.length)
      for (let i = 0; i < array.length; ++i) {
        typedArray[i] = this.type.marshall(array[i], memoryManager)
      }
    } else {
      const typedArray = new this.type.TypedArrayType(memoryManager.memory.buffer, address, array.length)
      typedArray.set(array)
    }

    return address
  }

  unmarshall (address, memoryManager, value) {
    try {
      const length = this.length || value.length
      const typedArray = new this.type.TypedArrayType(memoryManager.memory.buffer, address, length)
      return this.type instanceof ReferenceType
        ? Array.from(typedArray, x => this.type.unmarshall(x, memoryManager))
        : Array.from(typedArray)
    } finally {
      memoryManager.free(address)
    }
  }

  copy (dest, source) {
    dest.splice(0, dest.length, ...source)
    return dest
  }
}
