import { ValueType } from './ValueType'

export class Uint32Type extends ValueType {
  constructor () {
    super(Uint32Array)
  }

  marshall (value, memoryManager) {
    const address = this.alloc(memoryManager)
    memoryManager.dataView.setUint32(address, value)
    return address
  }

  unmarshall (address, memoryManager) {
    try {
      return memoryManager.dataView.getUint32(address)
    } finally {
      memoryManager.free(address)
    }
  }
}
