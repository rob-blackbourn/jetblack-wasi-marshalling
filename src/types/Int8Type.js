import { ValueType } from './ValueType'

export class Int8Type extends ValueType {
  constructor () {
    super(Int8Array)
  }

  marshall (value, memoryManager) {
    const address = this.alloc(memoryManager)
    memoryManager.dataView.setInt8(address, value)
    return address
  }

  unmarshall (address, memoryManager) {
    try {
      return memoryManager.dataView.getInt8(address)
    } finally {
      memoryManager.free(address)
    }
  }
}
