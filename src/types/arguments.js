import { ArgumentDef } from './ArgumentDef'

export class In extends ArgumentDef {
  constructor (type) {
    super(type, true, false)
  }
}

export class Out extends ArgumentDef {
  constructor (type) {
    super(type, false, true)
  }
}

export class InOut extends ArgumentDef {
  constructor (type) {
    super(type, true, true)
  }
}
