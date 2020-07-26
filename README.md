# WASI Marshalling

This library provides two things:

* The minimum WASI implementation required for supporting  memory allocation
  and strings.
* A marshalling framework for calling WebAssembly functions in a wasm module
  from JavaScript.

The intention is to provide support to "drop in" publicly available libraries
that can be compiled into a wasm module.

## Installation

The package can be installed from npm.

```bash
npm install --save @jetblack/wasi-marshalling
```

## The WASI Layer

Three WASI domains are implemented:

* stout/stderr - many libraries fall back to reporting errors over the standard
  output/error. These are redirected to `console.log` and `console.error`.
* string passing with UTF-8 requires a call to `setlocale` which in turn
  requires a system call to request environment variables. This call is
  intercepted, and returns a application provided set of the environment
  variables.
* memory management - most libraries make use of `malloc` and `free` to manage
  memory.

The implementation of the WASI layer is provided through a class of the
same name. Here is an example of initializing the library.

```javascript
import { Wasi } from '@jetblack/wasi-marshalling'

// Create the Wasi instance passing in environment variables.
const wasi = new Wasi({})

// Instantiate the wasm module.
WebAssembly.instantiateStreaming(
  fetch('example.wasm'), {
    wasi_snapshot_preview1: wasi.imports()
  })
  .then(res => {
    // Initialize the wasi instance
    wasi.init(res.instance)

    // Do something interesting ...
  })
```

## The Marshalling Framework

### Introduction

Given the following C function call which multiplies two arrays.

```C
#include <stdlib.h>

__attribute__((used)) double* multiplyFloat64ArraysReturningPtr (double* array1, double* array2, int length)
{
  double* result = (double*) malloc(length * sizeof(double));
  if (result == 0)
    return 0;

  for (int i = 0; i < length; ++i) {
    result[i] = array1[i] + array2[i];
  }

  return result;
}
```

We can define and call the following function prototype.

```javascript
import {
  ArrayType,
  Float64Type,
  Int32Type,
  FunctionPrototype,
  In
} from '@jetblack/wasi-marshalling.develop.js'

const prototype = new FunctionPrototype(
  // The arguments
  [
    new In(new ArrayType(new Float64Type())),
    new In(new ArrayType(new Float64Type())),
    new In(new Int32Type())
  ],
  // The return type
  new ArrayType(new Float64Type(), 4)
)

const result = prototype.invoke(
  wasi.memoryManager,
  wasi.instance.exports.multiplyFloat64ArraysReturningPtr,
  [1, 2, 3, 4],
  [5, 6, 7, 8],
  4)

console.log(result)
```

The framework will take care of passing the data to the wasm module,
unpacking the result and allocating/deallocating the memory.

Note how a length of 4 was passed for the return type. This is because the
function passes a pointer to the start of the result array, so the size is not
known. However, the length of a return array is often guaranteed by the input
arguments. In the above example the last parameter which specifies the length of
the input arrays is also the length of the output arrays. We can use this by
passing a callback function as the *length* argument. The function is provided
with the index of the argument for which the length is being queried (or -1 for
the result), and the unmarshalled input arguments.

We can re-write the prototype as follows.

```javascript
import {
  ArrayType,
  Float64Type,
  Int32Type,
  FunctionPrototype,
  In
} from '@jetblack/wasi-marshalling.develop.js'

const prototype = new FunctionPrototype(
  // The arguments
  [
    new In(new ArrayType(new Float64Type())),
    new In(new ArrayType(new Float64Type())),
    new In(new Int32Type())
  ],
  // The return type
  new ArrayType(new Float64Type(), (i, args) => args[2]))
)

const result = prototype.invoke(
  wasi.memoryManager,
  wasi.instance.exports.multiplyFloat64ArraysReturningPtr,
  [1, 2, 3, 4],
  [5, 6, 7, 8],
  4)

console.log(result)
```

### Finalizers and Typed Arrays

A recent introduction to JavaScript is the
[FinalizationRegistry](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/FinalizationRegistry).
This allows us to register a function to call when an object is garbage
collected. We can use this to handle memory management in WebAssembly.

The
[TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray)
family of objects provide transparent interoperability between Javascript and
WebAssembly. Rather than copying values (as with `ArrayType`) we can simply pass a
`TypedArray` via `TypedArrayType". The prototype fot the above functions would
look like this:

```javascript
import {
  TypedArrayType,
  Float64Type,
  Int32Type,
  FunctionPrototype,
  In
} from '@jetblack/wasi-marshalling.develop.js'

const proto = new FunctionPrototype(
  [
    new In(new TypedArrayType(new Float64Type())),
    new In(new TypedArrayType(new Float64Type())),
    new In(new Int32Type())
  ],
  new TypedArrayType(new Float64Type(), 4)
)

const result = proto.invoke(
  wasi.memoryManager,
  wasi.instance.exports.multiplyFloat64ArraysReturningPtr,
  wasi.memoryManager.createTypedArray(Float64Array, [1, 2, 3, 4]),
  wasi.memoryManager.createTypedArray(Float64Array, [5, 6, 7, 8]),
  4)

console.log(result)
```

Note how we call `createTypedArray` from the memory manager. This allocates
the memory and registers the pointer with the finalizer to ensure the memory
gets freed.

### Types

The framework handles the following types:

* Int8, Int16, Int32, Int64
* Uint8, Uint16, Uint32, Uint64
* Float32, Float64
* String
* Array
* Pointer

## Usage

To build the package:

```bash
npm install
npm run build
```

To Run the examples in the `client` folder.

```bash
# Run a node example
npm run exec:nodejs
# Run code in a `<script>` tag in the browser
npm run exec:browser
```
