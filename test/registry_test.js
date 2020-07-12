import assert from 'assert'
import { makeMockMemoryManager } from './mocks'
import {
  ArrayType,
  Float32Type,
  Float64Type,
  FunctionPrototype,
  In,
  Int32Type,
  Uint32Type,
  Out,
  Pointer,
  PointerType,
  StringType,
  VoidType,
  TypedArrayType,
  FunctionRegistry
} from '../src'

describe('test the function registry', () => {

  it('should register functions', () => {
    const registry = new FunctionRegistry()

    // Plus
    const plusName = Symbol.for('+')
    const plusIntProto = new FunctionPrototype(
      [
        new In(new TypedArrayType(new Int32Type(), null)),
        new In(new TypedArrayType(new Int32Type(), null)),
        new In(new Uint32Type())
      ],
      new TypedArrayType(new Int32Type(), (i, args) => args[2])
    )
    const plusFloatProto = new FunctionPrototype(
      [
        new In(new TypedArrayType(new Float32Type(), null)),
        new In(new TypedArrayType(new Float32Type(), null)),
        new In(new Uint32Type())
      ],
      new TypedArrayType(new Float32Type(), (i, args) => args[2])
    )
    const plusDoubleProto = new FunctionPrototype(
      [
        new In(new TypedArrayType(new Float64Type(), null)),
        new In(new TypedArrayType(new Float64Type(), null)),
        new In(new Uint32Type())
      ],
      new TypedArrayType(new Float64Type(), (i, args) => args[2])
    )

    registry.register(
      plusName,
      plusIntProto,
      (a, b, len) => new Int32Array(a.map((v, i) => v + b[i]))
    )

    registry.register(
      plusName,
      plusFloatProto,
      (a, b, len) => new Float32Array(a.map((v, i) => v + b[i]))
    )

    registry.register(
      plusName,
      plusDoubleProto,
      (a, b, len) => new Float64Array(a.map((v, i) => v + b[i]))
    )

    // Minus
    const minusName = Symbol.for('-')
    const minusIntProto = new FunctionPrototype(
      [
        new In(new TypedArrayType(new Int32Type(), null)),
        new In(new TypedArrayType(new Int32Type(), null)),
        new In(new Uint32Type())
      ],
      new TypedArrayType(new Int32Type(), (i, args) => args[2])
    )
    const minusFloatProto = new FunctionPrototype(
      [
        new In(new TypedArrayType(new Float32Type(), null)),
        new In(new TypedArrayType(new Float32Type(), null)),
        new In(new Uint32Type())
      ],
      new TypedArrayType(new Float32Type(), (i, args) => args[2])
    )
    const minusDoubleProto = new FunctionPrototype(
      [
        new In(new TypedArrayType(new Float64Type(), null)),
        new In(new TypedArrayType(new Float64Type(), null)),
        new In(new Uint32Type())
      ],
      new TypedArrayType(new Float64Type(), (i, args) => args[2])
    )

    registry.register(
      minusName,
      minusIntProto,
      (a, b, len) => new Int32Array(a.map((v, i) => v - b[i]))
    )

    registry.register(
      minusName,
      minusFloatProto,
      (a, b, len) => new Float32Array(a.map((v, i) => v - b[i]))
    )

    registry.register(
      minusName,
      minusDoubleProto,
      (a, b, len) => new Float64Array(a.map((v, i) => v - b[i]))
    )

    const plusIntArg1 = new Int32Array([1,2,3,4])
    const plusIntArg2 = new Int32Array([1,2,3,4])
    const plusIntCallback = registry.match(
      plusName,
      [plusIntArg1, plusIntArg2, 4],
      { defaultInt: Uint32Type.MANGLED_NAME, defaultFloat: Float64Type.MANGLED_NAME }
    )
    assert.ok(plusIntCallback != null)
    const plusIntResult = plusIntCallback(plusIntArg1, plusIntArg2, 4)
    assert.ok(plusIntResult instanceof Int32Array)
    assert.deepStrictEqual(plusIntResult, new Int32Array([2,4,6,8]))

    const minusIntArg1 = new Int32Array([1,2,3,4])
    const minusIntArg2 = new Int32Array([1,2,3,4])
    const minusIntCallback = registry.match(
      minusName,
      [minusIntArg1, minusIntArg2, 4],
      { defaultInt: Uint32Type.MANGLED_NAME, defaultFloat: Float64Type.MANGLED_NAME }
    )
    assert.ok(minusIntCallback != null)
    const minusIntResult = minusIntCallback(minusIntArg1, minusIntArg2, 4)
    assert.ok(minusIntResult instanceof Int32Array)
    assert.deepStrictEqual(minusIntResult, new Int32Array([0,0,0,0]))
  })

})
