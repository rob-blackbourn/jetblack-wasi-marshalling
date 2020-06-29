export class FunctionPrototype {
  constructor (argDefs, returns) {
    this.argDefs = argDefs
    this.returns = returns
  }

  invoke (memoryManager, func, ...args) {
    if (this.argDefs.length !== args.length) {
      throw new RangeError('Invalid number of arguments')
    }

    const marshalledArgs = args.map((arg, i) =>
      this.argDefs[i].marshall(arg, memoryManager))

    const result = func(...marshalledArgs)

    args.forEach((arg, i) =>
      this.argDefs[i].unmarshall(marshalledArgs[i], memoryManager, arg))

    if (this.returns != null) {
      return this.returns.unmarshall(result, memoryManager)
    }
  }
}
