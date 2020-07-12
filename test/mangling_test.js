import assert from 'assert'
import {
  ArrayType,
  Float32Type,
  Float64Type,
  FunctionPrototype,
  In,
  Int32Type,
  Uint64Type,
  Out,
  TypedArrayType
} from '../src'
import { VoidType } from '../src/types/VoidType'

describe('test the mangler', () => {
  it('should mangle function prototype', () => {
    const proto = new FunctionPrototype(
      [
        new In(new ArrayType(new Float64Type(), null)),
        new In(new ArrayType(new Float64Type(), null)),
        new In(new Int32Type())
      ],
      new ArrayType(new Float64Type(), 4)
    )

    assert.strictEqual(proto.mangledName, 'a(f64)_a(f64)a(f64)i32')
  })

  it('should mangle output argument', () => {
    const proto = new FunctionPrototype(
      [
        new In(new ArrayType(new Float64Type(), null)),
        new In(new ArrayType(new Float64Type(), null)),
        new Out(new ArrayType(new Float64Type(), null)),
        new In(new Int32Type())
      ],
      new VoidType()
    )

    assert.strictEqual(proto.mangledName, 'v0_a(f64)a(f64)a(f64)i32')
  }),

  it('should mangle nested arrays', () => {
    const proto = new FunctionPrototype(
      [
        new In(new ArrayType(new ArrayType(new Float64Type(), null))),
        new In(new ArrayType(new ArrayType(new Float64Type(), null))),
        new Out(new ArrayType(new ArrayType(new Float64Type(), null))),
        new In(new Int32Type()),
        new In(new Int32Type())
      ],
      new VoidType()
    )

    assert.strictEqual(proto.mangledName, 'v0_a(a(f64))a(a(f64))a(a(f64))i32i32')
  }),

  it('should mangle typed arrays', () => {
    const proto = new FunctionPrototype(
      [
        new In(new TypedArrayType(new Float32Type(), null)),
        new In(new TypedArrayType(new Float32Type(), null)),
        new Out(new TypedArrayType(new Float32Type(), null)),
        new In(new Uint64Type())
      ],
      new VoidType()
    )

    assert.strictEqual(proto.mangledName, "v0_t(f32)t(f32)t(f32)u64")
  })
})
