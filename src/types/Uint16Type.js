import { ValueType } from './ValueType'

export class Uint16Type extends ValueType {
  constructor () {
    super(Uint16Array)
  }

  marshall (value, memoryManager) {
    const address = this.alloc(memoryManager)
    memoryManager.dataView.setUint16(address, value)
    return address
  }

  unmarshall (address, memoryManager) {
    try {
      return memoryManager.dataView.getUint16(address)
    } finally {
      memoryManager.free(address)
    }
  }
}
