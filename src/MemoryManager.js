export class MemoryManager {
  constructor (memory, malloc, free) {
    this.memory = memory
    this.malloc = malloc
    this.free = free
    this.dataView = new DataView(this.memory.buffer)
  }
}
