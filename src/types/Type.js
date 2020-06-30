// @flow

import type { $TypedArray, Class } from 'flow-bin'

export class Type {
  TypedArrayType: Class<$TypedArray>

  constructor (typedArrayType: Class<$TypedArray>) {
    this.TypedArrayType = typedArrayType
  }
}
