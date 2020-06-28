import { ValueType } from './ValueType'

export class ArgumentDef {
  constructor (type, isInput, isOutput) {
    this.type = type
    this.isInput = isInput
    this.isOutput = isOutput
  }

  free (address, memoryManager, value) {
    if (this.type instanceof ValueType) {
      return
    }

    this.type.free(address, memoryManager, value)
  }

  marshall (value, memoryManager) {
    if (this.type instanceof ValueType) {
      return value
    } else if (this.isInput) {
      return this.type.marshall(value, memoryManager)
    } else {
      return this.type.alloc(memoryManager, value)
    }
  }

  unmarshall (address, memoryManager, value) {
    if (this.type instanceof ValueType) {
      return value
    }

    return this.type.unmarshall(address, memoryManager, value)
  }
}
