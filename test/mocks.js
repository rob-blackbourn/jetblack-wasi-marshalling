import Allocator from 'malloc'
import { MemoryManager, } from '../src/MemoryManager'

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
  
  const memoryManager = new MemoryManager({ buffer: heap, grow: null }, malloc, free)
  memoryManager.inspect = inspect
  memoryManager.usedCount = usedCount

  return memoryManager  
}
