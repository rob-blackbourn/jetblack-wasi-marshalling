import { ValueType } from './ValueType'

export class Float64Type extends ValueType {
  constructor () {
    super(Float64Array)
  }

  marshall (value, memoryManager) {
    const address = this.alloc(memoryManager)
    memoryManager.dataView.setFloat64(address, value)
    return address
  }

  unmarshall (address, memoryManager) {
    try {
      return memoryManager.dataView.getFloat64(address)
    } finally {
      memoryManager.free(address)
    }
  }
}
