import { ValueType } from './ValueType'

export class Float32Type extends ValueType {
  constructor () {
    super(Float32Array)
  }

  marshall (value, memoryManager) {
    const address = this.alloc(memoryManager)
    memoryManager.dataView.setFloat32(address, value)
    return address
  }

  unmarshall (address, memoryManager) {
    try {
      return memoryManager.dataView.getFloat32(address)
    } finally {
      memoryManager.free(address)
    }
  }
}
