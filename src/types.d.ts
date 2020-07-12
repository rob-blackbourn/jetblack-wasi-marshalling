
declare function malloc(byteLength: number): number;
declare function free(address: number): void;

declare class FinalizationRegistry {
    constructor(cleanup: (held: Array<any>) => void);
  
    register(item: any, tag: any): void;
}

declare function wasmCallback(...args: any): any;
