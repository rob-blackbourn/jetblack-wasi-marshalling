declare type int8 = number
declare type int16 = number
declare type int32 = number
declare type int64 = BigInteger

declare type uint8 = number
declare type uint16 = number
declare type uint32 = number
declare type uint64 = BigInteger

declare type float32 = number
declare type float64 = number

declare class BigInt64Array extends $TypedArray {}
declare class BigUint64Array extends $TypedArray {}

declare function malloc(byteLength: uint32): number
declare function free(address: number): void

declare class FinalizationRegistry {
    constructor(cleanup: (held: Array<any>) => void): FinalizationRegistry;

    register(item: any, tag: any): void;
}

declare class $DataView {
    constructor(buffer: ArrayBuffer, byteOffset?: number, length?: number): void;
    buffer: ArrayBuffer;
    byteLength: number;
    byteOffset: number;
    getInt8(byteOffset: number): number;
    getUint8(byteOffset: number): number;
    getInt16(byteOffset: number, littleEndian?: boolean): number;
    getUint16(byteOffset: number, littleEndian?: boolean): number;
    getInt32(byteOffset: number, littleEndian?: boolean): number;
    getUint32(byteOffset: number, littleEndian?: boolean): number;
    getFloat32(byteOffset: number, littleEndian?: boolean): number;
    getFloat64(byteOffset: number, littleEndian?: boolean): number;
    setInt8(byteOffset: number, value: number): void;
    setUint8(byteOffset: number, value: number): void;
    setInt16(byteOffset: number, value: number, littleEndian?: boolean): void;
    setUint16(byteOffset: number, value: number, littleEndian?: boolean): void;
    setInt32(byteOffset: number, value: number, littleEndian?: boolean): void;
    setUint32(byteOffset: number, value: number, littleEndian?: boolean): void;
    setBigInt64(byteOffset: number, value: int64, littleEndian?: boolean): void;
    setBigUint64(byteOffset: number, value: uint64, littleEndian?: boolean): void;
    setFloat32(byteOffset: number, value: number, littleEndian?: boolean): void;
    setFloat64(byteOffset: number, value: number, littleEndian?: boolean): void;
}

declare function wasmCallback(...args: any): any

declare function lengthCallback(unmarshalledIndex: number, unmarshalledArray: Array<any>): number
