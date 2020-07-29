

export declare type TypedArrayConstructor = Int8ArrayConstructor|Int16ArrayConstructor|Int32ArrayConstructor|BigInt64ArrayConstructor|Uint8ArrayConstructor|Uint16ArrayConstructor|Uint32ArrayConstructor|BigUint64ArrayConstructor|Float32ArrayConstructor|Float64ArrayConstructor
export declare type TypedArray = Int8Array|Int16Array|Int32Array|BigInt64Array|Uint8Array|Uint16Array|Uint32Array|BigUint64Array|Float32Array|Float64Array

export declare interface malloc{(byteLength: number): number}
export declare interface free{(byteLength: number): void}

export declare interface wasmCallback{(...args: any): any;}

export declare interface lengthCallback{(unmarshalledIndex: number, unmarshalledArgs: Array<any>): number;}

export declare interface mangleDefaults {
    defaultString?: string,
    defaultNumber?: string,
    defaultFloat?: string,
    defaultInt?: string
}