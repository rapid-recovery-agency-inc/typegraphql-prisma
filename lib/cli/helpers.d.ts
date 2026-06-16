export declare function parseStringBoolean(stringBoolean: string | string[] | undefined): boolean | undefined;
export declare function parseString(value: string | string[] | undefined, optionPropertyName: string): string | undefined;
export declare function parseStringArray<TAllowedValue extends string>(stringArray: string | string[] | undefined, optionPropertyName: string, allowedValues?: readonly TAllowedValue[]): TAllowedValue[] | undefined;
export declare function parseStringEnum<TAllowedValue extends string>(stringEnum: string | string[] | undefined, optionPropertyName: string, allowedValues: readonly TAllowedValue[]): TAllowedValue | undefined;
