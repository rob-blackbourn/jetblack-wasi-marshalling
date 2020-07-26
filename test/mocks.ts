import Allocator from './allocator'
import { MemoryManager, } from '../src/MemoryManager'

interface inspect{():any}
interface usedCount{(): number}

class MockMemoryManager extends MemoryManager {
  inspect: inspect
  usedCount: usedCount

  constructor(memory, malloc, free, inspect, usedCount) {
    super(memory, malloc, free)
    this.inspect = inspect
    this.usedCount = usedCount
  }
}

export function makeMockMemoryManager() {
  const heap = new ArrayBuffer(1024 * 1024)
  const allocator = new Allocator(heap)
  
  function malloc(numberOfBytes) {
    return allocator.alloc(numberOfBytes)
  }
  
  function free(address) {
    return allocator.free(address)
  }

  function inspect() {
    return allocator.inspect
  }

  function usedCount() {
    return allocator.inspect().blocks.reduce((acc, value) => value.type == 'used' ? acc + 1 : acc, 0)
  }

  malloc.bind(allocator)
  free.bind(allocator)
  inspect.bind(allocator)
  usedCount.bind(allocator)
  
  const memoryManager = new MockMemoryManager({ buffer: heap, grow: null }, malloc, free, inspect, usedCount)

  return memoryManager  
}
