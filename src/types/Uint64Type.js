import { ValueType } from './ValueType'

export class Uint64Type extends ValueType {
  constructor () {
    super(BigUint64Array)
  }

  marshall (value, memoryManager) {
    const address = this.alloc(memoryManager)
    memoryManager.dataView.setBigUint64(address, value)
    return address
  }

  unmarshall (address, memoryManager) {
    try {
      return memoryManager.dataView.getBigUint64(address)
    } finally {
      memoryManager.free(address)
    }
  }
}
