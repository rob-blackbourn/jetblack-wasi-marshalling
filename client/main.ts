const fs = require('fs')
const {
  Marshaller,
  Float64Type,
  ArrayType,
  TypedArrayType,
  Int32Type,
  StringType,
  StringBuffer,
  StringBufferType,
  VoidType,
  FunctionPrototype,
  In,
  Out,
  MemoryManager
} = require('../src/index')

async function setupWasi (fileName: string, envVars: { [key: string]: string}): Promise<typeof Marshaller> {
  // Read the wasm file.
  const buf = fs.readFileSync(fileName)

  // Create the Marshaller instance passing in environment variables.
  const marshaller = new Marshaller(envVars)

  // Instantiate the wasm module.
  const res = await WebAssembly.instantiate(buf, {
    wasi_snapshot_preview1: marshaller.wasiImplementation()
  })

  // Initialize the marshaller instance
  marshaller.init(res.instance)

  return marshaller
}

function marshallExample(marshaller: typeof Marshaller) {
  const value = ['one', 'two', 'three', 'four']
  const type = new ArrayType(new StringType(), value.length)
  const ptr = type.marshall(marshaller.memoryManager, 0, [value])
  const roundtrip = type.unmarshall(marshaller.memoryManager, ptr, -1, [])
  console.log(roundtrip)

  const proto = new FunctionPrototype(
    [
      new In(new ArrayType(new Float64Type(), null)),
      new In(new ArrayType(new Float64Type(), null)),
      new In(new Int32Type())
    ],
    new ArrayType(new Float64Type(), 4)
  )

  console.log(proto.mangledName, 'a(f64)_a(f64)a(f64)i32')
}

function mangleExample() {
  const proto1 = new FunctionPrototype(
    [
      new In(new TypedArrayType(new Float64Type())),
      new In(new TypedArrayType(new Float64Type())),
      new In(new Int32Type())
    ],
    new ArrayType(new Float64Type(), (i, args) => args[2])
  )

  console.log(proto1.mangledName)
  console.log(FunctionPrototype.mangleValues([new Float64Array([1,2,3,4]), new Float64Array([1,2,3,4]), 4], {}))
}

async function main () {
  const marshaller = await setupWasi('./client/example.wasm', {})

  marshallExample(marshaller)

  // The first example takes in two arrays on the same length and
  // multiplies them, returning a third array.
  const proto1 = new FunctionPrototype(
    [
      new In(new ArrayType(new Float64Type())),
      new In(new ArrayType(new Float64Type())),
      new In(new Int32Type())
    ],
    new ArrayType(new Float64Type(), (i, args) => args[2])
  )

  const result1 = proto1.invoke(
    marshaller.memoryManager,
    marshaller.instance.exports.multiplyFloat64ArraysReturningPtr,
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    4)
  console.log(result1)

  mangleExample()

  // The second example takes in three arrays, multiplying the first
  // two are storing the output in the third.
  const proto2 = new FunctionPrototype(
    [
      new In(new ArrayType(new Float64Type())),
      new In(new ArrayType(new Float64Type())),
      new Out(new ArrayType(new Float64Type())),
      new In(new Int32Type())
    ],
    new VoidType()
  )

  const output = new Array(4)
  proto2.invoke(
    marshaller.memoryManager,
    marshaller.instance.exports.multiplyFloat64ArraysWithOutputArray,
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    output,
    4)
  console.log(output)

  // The third example reverses a string.
  const proto3 = new FunctionPrototype(
    [
      new In(new StringType())
    ],
    new StringType()
  )
  const reversed = proto3.invoke(
    marshaller.memoryManager,
    marshaller.instance.exports.reverseString,
    'abcdefg'
  )
  console.log(reversed)


  const proto4 = new FunctionPrototype(
    [
      new In(new TypedArrayType(new Float64Type())),
      new In(new TypedArrayType(new Float64Type())),
      new In(new Int32Type())
    ],
    new TypedArrayType(new Float64Type(), 4)
  )

  const result4 = proto4.invoke(
    marshaller.memoryManager,
    marshaller.instance.exports.multiplyFloat64ArraysReturningPtr,
    marshaller.memoryManager.createTypedArray(Float64Array, [1, 2, 3, 4]),
    marshaller.memoryManager.createTypedArray(Float64Array, [5, 6, 7, 8]),
    4)
  console.log(result4)

  const proto5 = new FunctionPrototype(
    [
      new In(new TypedArrayType(new Float64Type())),
      new In(new TypedArrayType(new Float64Type())),
      new Out(new TypedArrayType(new Float64Type())),
      new In(new Int32Type())
    ],
    new VoidType()
  )

  const output2 = marshaller.memoryManager.createTypedArray(Float64Array, 4)
  proto5.invoke(
    marshaller.memoryManager,
    marshaller.instance.exports.multiplyFloat64ArraysWithOutputArray,
    marshaller.memoryManager.createTypedArray(Float64Array, [1, 2, 3, 4]),
    marshaller.memoryManager.createTypedArray(Float64Array, [5, 6, 7, 8]),
    output2,
    4)
  console.log(output2)


  // Reverse a string using a string buffer
  const proto6 = new FunctionPrototype(
    [
      new In(new StringBufferType())
    ],
    new StringBufferType()
  )
  const result6 = proto6.invoke(
    marshaller.memoryManager,
    marshaller.instance.exports.reverseString,
    StringBuffer.fromString(marshaller.memoryManager, 'abcdefg', true)
  )
  console.log(result6.toString())

  const proto7 = new FunctionPrototype(
    [
      new In(new StringType())
    ],
    new VoidType()
  )
  proto7.invoke(
    marshaller.memoryManager,
    marshaller.instance.exports.sendToStdout,
    "Hello, World!\n"
  )

  proto7.invoke(
    marshaller.memoryManager,
    marshaller.instance.exports.sendToStderr,
    "Hello, World!\n"
  )
}

main()
  .then(() => console.log('Done'))
  .catch(error => console.error(error))
