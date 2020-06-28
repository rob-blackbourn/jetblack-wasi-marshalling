import { ValueType } from './ValueType'

export class Int32Type extends ValueType {
  constructor () {
    super(Int32Array)
  }

  marshall (value, memoryManager) {
    const address = this.alloc(memoryManager)
    memoryManager.dataView.setInt32(address, value)
    return address
  }

  unmarshall (address, memoryManager) {
    try {
      return memoryManager.dataView.getInt32(address)
    } finally {
      memoryManager.free(address)
    }
  }
}
