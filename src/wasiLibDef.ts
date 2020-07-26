declare class FinalizationRegistry {
    constructor(cleanup: (held: Array<any>) => void);
  
    register(item: any, tag: any): void;
}

declare type TypedArrayConstructor = Int8ArrayConstructor|Int16ArrayConstructor|Int32ArrayConstructor|BigInt64ArrayConstructor|Uint8ArrayConstructor|Uint16ArrayConstructor|Uint32ArrayConstructor|BigUint64ArrayConstructor|Float32ArrayConstructor|Float64ArrayConstructor
declare type TypedArray = Int8Array|Int16Array|Int32Array|BigInt64Array|Uint8Array|Uint16Array|Uint32Array|BigUint64Array|Float32Array|Float64Array

declare interface malloc{(byteLength: number): number}
declare interface free{(byteLength: number): void}

declare interface wasmCallback{(...args: any): any;}

declare interface lengthCallback{(unmarshalledIndex: number, unmarshalledArgs: Array<any>): number;}
