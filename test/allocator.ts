const POINTER_SIZE_IN_BYTES = 4;
const MAX_HEIGHT = 32;


const HEADER_SIZE_IN_QUADS = 1 + (MAX_HEIGHT * 2);
const HEADER_OFFSET_IN_QUADS = 1;

const HEIGHT_OFFSET_IN_QUADS = 0;
const PREV_OFFSET_IN_QUADS = 1;
const NEXT_OFFSET_IN_QUADS = 2;

const POINTER_SIZE_IN_QUADS = 1;
const POINTER_OVERHEAD_IN_QUADS = 2;

const MIN_FREEABLE_SIZE_IN_QUADS = 3;
const FIRST_BLOCK_OFFSET_IN_QUADS = HEADER_OFFSET_IN_QUADS + HEADER_SIZE_IN_QUADS + POINTER_OVERHEAD_IN_QUADS;

const MIN_FREEABLE_SIZE_IN_BYTES = 16;
const FIRST_BLOCK_OFFSET_IN_BYTES = FIRST_BLOCK_OFFSET_IN_QUADS * POINTER_SIZE_IN_BYTES;
const OVERHEAD_IN_BYTES = (FIRST_BLOCK_OFFSET_IN_QUADS + 1) * POINTER_SIZE_IN_BYTES;

const ALIGNMENT_IN_BYTES = 8;
const ALIGNMENT_MASK = ALIGNMENT_IN_BYTES - 1;

const UPDATES: Int32Array = (new Int32Array(MAX_HEIGHT)).fill(HEADER_OFFSET_IN_QUADS);

type ListNode = {
  type: string;
  offset: number;
  size: number;
  height: number;
  pointers: number[];
};

type InspectionResult = {
  header: ListNode;
  blocks: Array<{
    type: string;
    size: number;
    node?: ListNode
  }>;
};

export default class Allocator {

  buffer: ArrayBuffer;
  byteOffset: number;
  byteLength: number;
  int32Array: Int32Array;

  /**
   * Initialize the allocator from the given Buffer or ArrayBuffer.
   */
  constructor (buffer: Buffer|ArrayBuffer, byteOffset: number = 0, byteLength: number = 0) {
    if (buffer instanceof Buffer) {
      this.buffer = buffer.buffer;
      this.byteOffset = buffer.byteOffset + byteOffset;
      this.byteLength = byteLength === 0 ? buffer.length : byteLength;
    }
    else if (buffer instanceof ArrayBuffer) {
      this.buffer = buffer;
      this.byteOffset = byteOffset;
      this.byteLength = byteLength === 0 ? buffer.byteLength - byteOffset : byteLength;
    }
    else {
      throw new TypeError(`Expected buffer to be an instance of Buffer or ArrayBuffer`);
    }
    this.int32Array = prepare(new Int32Array(this.buffer, this.byteOffset, bytesToQuads(this.byteLength)));
    checkListIntegrity(this.int32Array);
  }

  /**
   * Allocate a given number of bytes and return the offset.
   * If allocation fails, returns 0.
   */
  alloc (numberOfBytes: number): number {

    numberOfBytes = align(numberOfBytes);

    if (numberOfBytes < MIN_FREEABLE_SIZE_IN_BYTES) {
      numberOfBytes = MIN_FREEABLE_SIZE_IN_BYTES;
    }
    else if (numberOfBytes > this.byteLength) {
      throw new RangeError(`Allocation size must be between ${MIN_FREEABLE_SIZE_IN_BYTES} bytes and ${this.byteLength - OVERHEAD_IN_BYTES} bytes`);
    }

    const minimumSize: number = bytesToQuads(numberOfBytes);
    const int32Array: Int32Array = this.int32Array;
    const block: number = findFreeBlock(int32Array, minimumSize);
    if (block <= HEADER_OFFSET_IN_QUADS) {
      return 0;
    }
    const blockSize: number = readSize(int32Array, block);

    if (blockSize - (minimumSize + POINTER_OVERHEAD_IN_QUADS) >= MIN_FREEABLE_SIZE_IN_QUADS) {
      split(int32Array, block, minimumSize, blockSize);
    }
    else {
      remove(int32Array, block, blockSize);
    }

    return quadsToBytes(block);
  }

  /**
   * Allocate and clear the given number of bytes and return the offset.
   * If allocation fails, returns 0.
   */
  calloc (numberOfBytes: number): number {
    if (numberOfBytes < MIN_FREEABLE_SIZE_IN_BYTES) {
      numberOfBytes = MIN_FREEABLE_SIZE_IN_BYTES;
    }
    else {
      numberOfBytes = align(numberOfBytes);
    }

    const address = this.alloc(numberOfBytes);
    if (address === 0) {
      // Not enough space
      return 0;
    }
    const int32Array = this.int32Array;
    const offset = bytesToQuads(address);
    const limit = numberOfBytes / 4;
    for (let i = 0; i < limit; i++) {
      int32Array[offset + i] = 0;
    }
    return address;
  }

  /**
   * Free a number of bytes from the given address.
   */
  free (address: number): number {

    if ((address & ALIGNMENT_MASK) !== 0) {
      throw new RangeError(`Address must be a multiple of (${ALIGNMENT_IN_BYTES}).`);
    }

    if (address < FIRST_BLOCK_OFFSET_IN_BYTES || address > this.byteLength) {
      throw new RangeError(`Address must be between ${FIRST_BLOCK_OFFSET_IN_BYTES} and ${this.byteLength - OVERHEAD_IN_BYTES}`);
    }

    const int32Array: Int32Array = this.int32Array;
    const block = bytesToQuads(address);

    const blockSize: number = readSize(int32Array, block);

    /* istanbul ignore if  */
    if (blockSize < MIN_FREEABLE_SIZE_IN_QUADS || blockSize > (this.byteLength - OVERHEAD_IN_BYTES) / 4) {
      throw new RangeError(`Invalid block: ${block}, got block size: ${quadsToBytes(blockSize)}`);
    }

    const preceding: number = getFreeBlockBefore(int32Array, block);
    const trailing: number = getFreeBlockAfter(int32Array, block);
    if (preceding !== 0) {
      if (trailing !== 0) {
        return quadsToBytes(insertMiddle(int32Array, preceding, block, blockSize, trailing));
      }
      else {
        return quadsToBytes(insertAfter(int32Array, preceding, block, blockSize));
      }
    }
    else if (trailing !== 0) {
      return quadsToBytes(insertBefore(int32Array, trailing, block, blockSize));
    }
    else {
      return quadsToBytes(insert(int32Array, block, blockSize));
    }
  }

  /**
   * Return the size of the block at the given address.
   */
  sizeOf (address: number): number {
    if (address < FIRST_BLOCK_OFFSET_IN_BYTES || address > this.byteLength || typeof address !== 'number' || isNaN(address)) {
      throw new RangeError(`Address must be between ${FIRST_BLOCK_OFFSET_IN_BYTES} and ${this.byteLength - OVERHEAD_IN_BYTES}`);
    }

    if ((address & ALIGNMENT_MASK) !== 0) {
      throw new RangeError(`Address must be a multiple of the pointer size (${POINTER_SIZE_IN_BYTES}).`);
    }

    return quadsToBytes(readSize(this.int32Array, bytesToQuads(address)));
  }

  /**
   * Inspect the instance.
   */
  inspect (): InspectionResult {
    return inspect(this.int32Array);
  }
}

/**
 * Prepare the given int32Array and ensure it contains a valid header.
 */
export function prepare (int32Array: Int32Array): Int32Array {
  if (!verifyHeader(int32Array)) {
    writeInitialHeader(int32Array);
  }
  return int32Array;
}

/**
 * Verify that the int32Array contains a valid header.
 */
export function verifyHeader (int32Array: Int32Array): boolean {
  return int32Array[HEADER_OFFSET_IN_QUADS - 1] === HEADER_SIZE_IN_QUADS
      && int32Array[HEADER_OFFSET_IN_QUADS + HEADER_SIZE_IN_QUADS] === HEADER_SIZE_IN_QUADS;
}

/**
 * Write the initial header for an empty int32Array.
 */
function writeInitialHeader (int32Array: Int32Array) {
  const header = HEADER_OFFSET_IN_QUADS;
  const headerSize = HEADER_SIZE_IN_QUADS;
  const block = FIRST_BLOCK_OFFSET_IN_QUADS;
  const blockSize = int32Array.length - (header + headerSize + POINTER_OVERHEAD_IN_QUADS + POINTER_SIZE_IN_QUADS);

  writeFreeBlockSize(int32Array, headerSize, header);
  int32Array[header + HEIGHT_OFFSET_IN_QUADS] = 1;
  int32Array[header + NEXT_OFFSET_IN_QUADS] = block;
  for (let height = 1; height < MAX_HEIGHT; height++) {
    int32Array[header + NEXT_OFFSET_IN_QUADS + height] = HEADER_OFFSET_IN_QUADS;
  }

  writeFreeBlockSize(int32Array, blockSize, block);
  int32Array[block + HEIGHT_OFFSET_IN_QUADS] = 1;
  int32Array[block + NEXT_OFFSET_IN_QUADS] = header;
}

/**
 * Check the integrity of the freelist in the given array.
 */
export function checkListIntegrity (int32Array: Int32Array): boolean {
  let block: number = FIRST_BLOCK_OFFSET_IN_QUADS;
  while (block < int32Array.length - POINTER_SIZE_IN_QUADS) {
    const size: number = readSize(int32Array, block);
    /* istanbul ignore if  */
    if (size < POINTER_OVERHEAD_IN_QUADS || size >= int32Array.length - FIRST_BLOCK_OFFSET_IN_QUADS) {
      throw new Error(`Got invalid sized chunk at ${quadsToBytes(block)} (${quadsToBytes(size)} bytes).`);
    }
    else if (isFree(int32Array, block)) {
      checkFreeBlockIntegrity(int32Array, block, size);
    }
    else {
      checkUsedBlockIntegrity(int32Array, block, size);
    }
    block += size + POINTER_OVERHEAD_IN_QUADS;
  }
  return true;
}

function checkFreeBlockIntegrity (int32Array: Int32Array, block: number, blockSize: number): boolean {
  /* istanbul ignore if  */
  if (int32Array[block - 1] !== int32Array[block + blockSize]) {
    throw new Error(`Block length header does not match footer (${quadsToBytes(int32Array[block - 1])} vs ${quadsToBytes(int32Array[block + blockSize])}).`);
  }
  const height: number = int32Array[block + HEIGHT_OFFSET_IN_QUADS];
  /* istanbul ignore if  */
  if (height < 1 || height > MAX_HEIGHT) {
    throw new Error(`Block ${quadsToBytes(block)} height must be between 1 and ${MAX_HEIGHT}, got ${height}.`);
  }
  for (let i = 0; i < height; i++) {
    const pointer = int32Array[block + NEXT_OFFSET_IN_QUADS + i];
    /* istanbul ignore if  */
    if (pointer >= FIRST_BLOCK_OFFSET_IN_QUADS && !isFree(int32Array, pointer)) {
      throw new Error(`Block ${quadsToBytes(block)} has a pointer to a non-free block (${quadsToBytes(pointer)}).`);
    }
  }
  return true;
}

function checkUsedBlockIntegrity (int32Array: Int32Array, block: number, blockSize: number): boolean {
  /* istanbul ignore if  */
  if (int32Array[block - 1] !== int32Array[block + blockSize]) {
    throw new Error(`Block length header does not match footer (${quadsToBytes(int32Array[block - 1])} vs ${quadsToBytes(int32Array[block + blockSize])}).`);
  }
  else {
    return true;
  }
}


/**
 * Inspect the freelist in the given array.
 */
export function inspect (int32Array: Int32Array): InspectionResult {
  const blocks: {type: string; size: number; node?: ListNode, offset: number}[] = [];
  const header: ListNode = readListNode(int32Array, HEADER_OFFSET_IN_QUADS);
  let block: number = FIRST_BLOCK_OFFSET_IN_QUADS;
  while (block < int32Array.length - POINTER_SIZE_IN_QUADS) {
    const size: number = readSize(int32Array, block);
    /* istanbul ignore if  */
    if (size < POINTER_OVERHEAD_IN_QUADS || size >= int32Array.length) {
      throw new Error(`Got invalid sized chunk at ${quadsToBytes(block)} (${quadsToBytes(size)})`);
    }
    if (isFree(int32Array, block)) {
      blocks.push(readListNode(int32Array, block));
    }
    else {
      blocks.push({
        type: 'used',
        offset: quadsToBytes(block),
        size: quadsToBytes(size)
      });
    }
    block += size + POINTER_OVERHEAD_IN_QUADS;
  }
  return {header, blocks};
}

/**
 * Convert quads to bytes.
 */
function quadsToBytes (num: number): number {
  return num * POINTER_SIZE_IN_BYTES;
}

/**
 * Convert bytes to quads.
 */
function bytesToQuads (num: number): number {
  return Math.ceil(num / POINTER_SIZE_IN_BYTES);
}

/**
 * Align the given value to 8 bytes.
 */
function align (value: number): number {
  return (value + ALIGNMENT_MASK) & ~ALIGNMENT_MASK;
}

/**
 * Read the list pointers for a given block.
 */
function readListNode (int32Array: Int32Array, block: number): ListNode {
  const height: number = int32Array[block + HEIGHT_OFFSET_IN_QUADS];
  const pointers: number[] = [];
  for (let i = 0; i < height; i++) {
    pointers.push(quadsToBytes(int32Array[block + NEXT_OFFSET_IN_QUADS + i]));
  }

  return {
    type: 'free',
    offset: quadsToBytes(block),
    height,
    pointers,
    size: quadsToBytes(int32Array[block - 1])
  };
}


/**
 * Read the size (in quads) of the block at the given address.
 */
function readSize (int32Array: Int32Array, block: number): number {
  return Math.abs(int32Array[block - 1]);
}

/**
 * Write the size of the block at the given address.
 * Note: This ONLY works for free blocks, not blocks in use.
 */
function writeFreeBlockSize (int32Array: Int32Array, size: number, block: number): void {
  int32Array[block - 1] = size;
  int32Array[block + size] = size;
}

/**
 * Populate the `UPDATES` array with the offset of the last item in each
 * list level, *before* a node of at least the given size.
 */
function findPredecessors (int32Array: Int32Array, minimumSize: number): void {
  const listHeight: number = int32Array[HEADER_OFFSET_IN_QUADS + HEIGHT_OFFSET_IN_QUADS];

  let node: number = HEADER_OFFSET_IN_QUADS;

  for (let height = listHeight; height > 0; height--) {
    let next: number = node + NEXT_OFFSET_IN_QUADS + (height - 1);
    while (int32Array[next] >= FIRST_BLOCK_OFFSET_IN_QUADS && int32Array[int32Array[next] - 1] < minimumSize) {
      node = int32Array[next];
      next = node + NEXT_OFFSET_IN_QUADS + (height - 1);
    }
    UPDATES[height - 1] = node;
  }
}

/**
 * Find a free block with at least the given size and return its offset in quads.
 */
function findFreeBlock (int32Array: Int32Array, minimumSize: number): number {

  let block: number = HEADER_OFFSET_IN_QUADS;

  for (let height = int32Array[HEADER_OFFSET_IN_QUADS + HEIGHT_OFFSET_IN_QUADS]; height > 0; height--) {
    let next: number = int32Array[block + NEXT_OFFSET_IN_QUADS + (height - 1)];

    while (next !== HEADER_OFFSET_IN_QUADS && int32Array[next - 1] < minimumSize) {
      block = next;
      next = int32Array[block + NEXT_OFFSET_IN_QUADS + (height - 1)];
    }
  }

  block = int32Array[block + NEXT_OFFSET_IN_QUADS];
  if (block === HEADER_OFFSET_IN_QUADS) {
    return block;
  }
  else {
    return block;
  }
}


/**
 * Split the given block after a certain number of bytes and add the second half to the freelist.
 */
function split (int32Array: Int32Array, block: number, firstSize: number, blockSize: number): void {
  const second: number = (block + firstSize + POINTER_OVERHEAD_IN_QUADS);
  const secondSize: number = (blockSize - (second - block));

  remove(int32Array, block, blockSize);

  int32Array[block - 1] = -firstSize;
  int32Array[block + firstSize] = -firstSize;

  int32Array[second - 1] = -secondSize;
  int32Array[second + secondSize] = -secondSize;

  insert(int32Array, second, secondSize);
}

/**
 * Remove the given block from the freelist and mark it as allocated.
 */
function remove (int32Array: Int32Array, block: number, blockSize: number): void {
  findPredecessors(int32Array, blockSize);

  let node: number = int32Array[UPDATES[0] + NEXT_OFFSET_IN_QUADS];

  while (node !== block && node !== HEADER_OFFSET_IN_QUADS && int32Array[node - 1] <= blockSize) {
    for (let height: number = int32Array[node + HEIGHT_OFFSET_IN_QUADS] - 1; height >= 0; height--) {
      if (int32Array[node + NEXT_OFFSET_IN_QUADS + height] === block) {
        UPDATES[height] = node;
      }
    }
    node = int32Array[node + NEXT_OFFSET_IN_QUADS];
  }

  /* istanbul ignore if  */
  if (node !== block) {
    throw new Error(`Could not find block to remove.`);
  }

  let listHeight: number = int32Array[HEADER_OFFSET_IN_QUADS + HEIGHT_OFFSET_IN_QUADS];
  for (let height = 0; height < listHeight; height++) {
    const next: number = int32Array[UPDATES[height] + NEXT_OFFSET_IN_QUADS + height];
    if (next !== block) {
      break;
    }
    int32Array[UPDATES[height] + NEXT_OFFSET_IN_QUADS + height] = int32Array[block + NEXT_OFFSET_IN_QUADS + height];
  }

  while (listHeight > 0 && int32Array[HEADER_OFFSET_IN_QUADS + NEXT_OFFSET_IN_QUADS + (listHeight - 1)] === HEADER_OFFSET_IN_QUADS) {
    listHeight--;
    int32Array[HEADER_OFFSET_IN_QUADS + HEIGHT_OFFSET_IN_QUADS] = listHeight;
  }
  // invert the size sign to signify an allocated block
  int32Array[block - 1] = -blockSize;
  int32Array[block + blockSize] = -blockSize;
}

/**
 * Iterate all of the free blocks in the list, looking for pointers to the given block.
 */
function hasPointersTo (int32Array: Int32Array, block: number): boolean {
  let next: number = FIRST_BLOCK_OFFSET_IN_QUADS;

  while (next < int32Array.length - POINTER_SIZE_IN_QUADS) {
    if (isFree(int32Array, next)) {
      for (let height = int32Array[next + HEIGHT_OFFSET_IN_QUADS] - 1; height >= 0; height--) {
        const pointer: number = int32Array[next + NEXT_OFFSET_IN_QUADS + height];
        /* istanbul ignore if  */
        if (pointer === block) {
          return true;
        }
      }
    }
    next += readSize(int32Array, next) + POINTER_OVERHEAD_IN_QUADS;
  }
  return false;
}

/**
 * Determine whether the block at the given address is free or not.
 */
function isFree (int32Array: Int32Array, block: number): boolean {
  /* istanbul ignore if  */
  if (block < HEADER_SIZE_IN_QUADS) {
    return false;
  }

  const size: number = int32Array[block - POINTER_SIZE_IN_QUADS];

  if (size < 0) {
    return false;
  }
  else {
    return true;
  }
}


/**
 * Get the address of the block before the given one and return the address *if it is free*,
 * otherwise 0.
 */
function getFreeBlockBefore (int32Array: Int32Array, block: number): number {
  if (block <= FIRST_BLOCK_OFFSET_IN_QUADS) {
    return 0;
  }
  const beforeSize: number = int32Array[block - POINTER_OVERHEAD_IN_QUADS];

  if (beforeSize < POINTER_OVERHEAD_IN_QUADS) {
    return 0;
  }
  return block - (POINTER_OVERHEAD_IN_QUADS + beforeSize);
}

/**
 * Get the address of the block after the given one and return its address *if it is free*,
 * otherwise 0.
 */
function getFreeBlockAfter (int32Array: Int32Array, block: number): number {
  const blockSize: number = readSize(int32Array, block);
  if (block + blockSize + POINTER_OVERHEAD_IN_QUADS >= int32Array.length - 2) {
    // Block is the last in the list.
    return 0;
  }
  const next: number = (block + blockSize + POINTER_OVERHEAD_IN_QUADS);
  const nextSize: number = int32Array[next - POINTER_SIZE_IN_QUADS];

  if (nextSize < POINTER_OVERHEAD_IN_QUADS) {
    return 0;
  }
  return next;
}


/**
 * Insert the given block into the freelist and return the number of bytes that were freed.
 */
function insert (int32Array: Int32Array, block: number, blockSize: number): number {
  findPredecessors(int32Array, blockSize);

  const blockHeight: number = generateHeight(int32Array, block, blockSize);
  const listHeight: number = int32Array[HEADER_OFFSET_IN_QUADS + HEIGHT_OFFSET_IN_QUADS];

  for (let height = 1; height <= blockHeight; height++) {
    const update: number = UPDATES[height - 1] + NEXT_OFFSET_IN_QUADS + (height - 1);
    int32Array[block + NEXT_OFFSET_IN_QUADS + (height - 1)] = int32Array[update];
    int32Array[update] = block;
    UPDATES[height - 1] = HEADER_OFFSET_IN_QUADS;
  }

  int32Array[block - 1] = blockSize;
  int32Array[block + blockSize] = blockSize;
  return blockSize;
}


/**
 * Insert the given block into the freelist before the given free block,
 * joining them together, returning the number of bytes which were freed.
 */
function insertBefore (int32Array: Int32Array, trailing: number, block: number, blockSize: number): number {
  const trailingSize: number = readSize(int32Array, trailing);
  remove(int32Array, trailing, trailingSize);
  const size: number = (blockSize + trailingSize + POINTER_OVERHEAD_IN_QUADS);
  int32Array[block - POINTER_SIZE_IN_QUADS] = -size;
  int32Array[trailing + trailingSize] = -size;
  insert(int32Array, block, size);
  return blockSize;
}

/**
 * Insert the given block into the freelist in between the given free blocks,
 * joining them together, returning the number of bytes which were freed.
 */
function insertMiddle (int32Array: Int32Array, preceding: number, block: number, blockSize: number, trailing: number): number {
  const precedingSize: number = readSize(int32Array, preceding);
  const trailingSize: number = readSize(int32Array, trailing);
  const size: number = ((trailing - preceding) + trailingSize);

  remove(int32Array, preceding, precedingSize);
  remove(int32Array, trailing, trailingSize);
  int32Array[preceding - POINTER_SIZE_IN_QUADS] = -size;
  int32Array[trailing + trailingSize] = -size;
  insert(int32Array, preceding, size);
  return blockSize;
}

/**
 * Insert the given block into the freelist after the given free block,
 * joining them together, returning the number of bytes which were freed.
 */
function insertAfter (int32Array: Int32Array, preceding: number, block: number, blockSize: number): number {
  const precedingSize: number = (block - preceding) - POINTER_OVERHEAD_IN_QUADS;

  const size: number = ((block - preceding) + blockSize);
  remove(int32Array, preceding, precedingSize);
  int32Array[preceding - POINTER_SIZE_IN_QUADS] = -size;
  int32Array[block + blockSize] = -size;
  insert(int32Array, preceding, size);
  return blockSize;
}



/**
 * Generate a random height for a block, growing the list height by 1 if required.
 */
function generateHeight (int32Array: Int32Array, block: number, blockSize: number): number {
  const listHeight: number = int32Array[HEADER_OFFSET_IN_QUADS + HEIGHT_OFFSET_IN_QUADS];
  let height: number = randomHeight();

  if (blockSize - 1 < height + 1) {
    height = blockSize - 2;
  }

  if (height > listHeight) {
    const newHeight: number = listHeight + 1;
    int32Array[HEADER_OFFSET_IN_QUADS + HEIGHT_OFFSET_IN_QUADS] = newHeight;
    int32Array[HEADER_OFFSET_IN_QUADS + NEXT_OFFSET_IN_QUADS + (newHeight - 1)] = HEADER_OFFSET_IN_QUADS;
    UPDATES[newHeight] = HEADER_OFFSET_IN_QUADS;
    int32Array[block + HEIGHT_OFFSET_IN_QUADS] = newHeight;
    return newHeight;
  }
  else {
    int32Array[block + HEIGHT_OFFSET_IN_QUADS] = height;
    return height;
  }
}

/**
 * Generate a random height for a new block.
 */
function randomHeight (): number {
  let height: number = 1;
  for (let r: number = Math.ceil(Math.random() * 2147483648); (r & 1) === 1 && height < MAX_HEIGHT; r >>= 1) {
    height++;
    Math.ceil(Math.random() * 2147483648)
  }
  return height;
}
