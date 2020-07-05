
declare function malloc(byteLength: number): number;
declare function free(address: number): void;

declare class FinalizationRegistry {
    constructor(cleanup: (held: Array<any>) => void);
  
    register(item: any, tag: any): void;
}

declare class TypedArray {
    constructor(buffer: ArrayBuffer, byteOffset: number, length: number);

    byteOffset: number;
    length: number;

    forEach(callback: (item: any, i: number) => void): void;
}