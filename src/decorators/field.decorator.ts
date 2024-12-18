/* eslint-disable @typescript-eslint/no-invalid-void-type, @typescript-eslint/no-wrapper-object-types */
/**
 * Importing npm packages
 */
import merge from 'deepmerge';
import { Class, IfAny } from 'type-fest';

/**
 * Importing user defined packages
 */
import { DESIGN_TYPE_METADATA, FIELD_OPTIONS_METADATA, FIELD_TYPE_METADATA, SCHEMA_FIELDS_METADATA } from '@lib/constants';
import { JSONArraySchema, JSONBasicSchema, JSONNumberSchema, JSONObjectSchema, JSONSchema, JSONStringSchema } from '@lib/interfaces';

/**
 * Defining types
 */

export type FieldType = Class<any> | Class<any>[];

export type ReturnTypeFunc = (returns?: void) => FieldType;

export type FieldOptions<T extends JSONBasicSchema<unknown> = any> = IfAny<T, JSONSchema<true>, Partial<T>> & {
  /** Whether this field is required. default is `true` */
  required?: boolean;
};

/**
 * Declaring the constants
 */

export function Field(options?: FieldOptions): PropertyDecorator;
export function Field(returnTypeFn: (returns?: void) => Class<String>, options?: FieldOptions<JSONStringSchema>): PropertyDecorator;
export function Field(returnTypeFn: (returns?: void) => Class<Number>, options?: FieldOptions<JSONNumberSchema>): PropertyDecorator;
export function Field(returnTypeFn: (returns?: void) => Class<Boolean>, options?: FieldOptions<JSONBasicSchema<boolean>>): PropertyDecorator;
export function Field(returnTypeFn: (returns?: void) => Class<any>, options?: FieldOptions<JSONObjectSchema<true>>): PropertyDecorator;
export function Field(returnTypeFn: (returns?: void) => Class<any>[], options?: FieldOptions<JSONArraySchema>): PropertyDecorator;
export function Field(typeOrOptions?: ReturnTypeFunc | FieldOptions, fieldOptions?: FieldOptions<any>): PropertyDecorator {
  const isTypeFn = typeof typeOrOptions === 'function';
  const options = (isTypeFn ? fieldOptions : typeOrOptions) ?? {};

  return (target, propertyKey) => {
    if (typeof propertyKey === 'symbol') throw new Error(`Cannot apply @Field() to symbol ${propertyKey.toString()}`);
    const reflectedType = Reflect.getMetadata(DESIGN_TYPE_METADATA, target, propertyKey);
    const getType = isTypeFn ? typeOrOptions : () => reflectedType;
    Reflect.defineMetadata(FIELD_TYPE_METADATA, getType, target, propertyKey);

    const fields: string[] = Reflect.getMetadata(SCHEMA_FIELDS_METADATA, target) ?? [];
    Reflect.defineMetadata(SCHEMA_FIELDS_METADATA, fields.concat([propertyKey]), target);

    const oldOptions = Reflect.getMetadata(FIELD_OPTIONS_METADATA, target, propertyKey) ?? {};
    const newOptions = merge.all([{}, oldOptions, options]);
    Reflect.defineMetadata(FIELD_OPTIONS_METADATA, newOptions, target, propertyKey);
  };
}
