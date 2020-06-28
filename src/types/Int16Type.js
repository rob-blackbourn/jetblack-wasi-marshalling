import { ValueType } from './ValueType'

export class Int16Type extends ValueType {
  constructor () {
    super(Int8Array)
  }

  marshall (value, memoryManager) {
    const address = this.alloc(memoryManager)
    memoryManager.dataView.setInt16(address, value)
    return address
  }

  unmarshall (address, memoryManager) {
    try {
      return memoryManager.dataView.getInt16(address)
    } finally {
      memoryManager.free(address)
    }
  }
}
