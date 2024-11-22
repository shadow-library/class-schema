/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

type SchemaWithOutCommonTypes<T> = Omit<T, 'type' | 'enum' | 'default' | 'examples' | 'const'>;

export type JSONSchemaType = 'string' | 'number' | 'boolean' | 'array' | 'object';

export interface JSONBasicSchema<T> {
  /** Basic schema properties */
  $id?: string;
  $ref?: string;
  type?: JSONSchemaType | JSONSchemaType[];

  /** Metadata and annotations */
  title?: string;
  description?: string;
  enum?: T[];
  default?: T;
  examples?: T[];

  /** Other possible fields */
  const?: T;
  definitions?: Record<string, JSONSchema>;
  [key: string]: unknown;
}

export interface JSONObjectSchema extends JSONBasicSchema<object> {
  type: 'object';
  properties?: Record<string, JSONSchema>;
  required?: string[];
  maxProperties?: number;
  minProperties?: number;
  additionalProperties?: boolean | JSONSchema;
  patternProperties?: Record<string, JSONSchema>;
  dependencies?: Record<string, JSONSchema | string[]>;
}

export interface JSONArraySchema extends JSONBasicSchema<any[]> {
  type: 'array';
  items?: JSONSchema | JSONSchema[];
  additionalItems?: boolean | JSONSchema;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
}

export interface JSONStringSchema extends JSONBasicSchema<string> {
  type: 'string';
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: string;
}

export interface JSONNumberSchema extends JSONBasicSchema<number> {
  type: 'number';
  format?: string;
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  multipleOf?: number;
}

export interface JSONConditionalSchema extends JSONBasicSchema<unknown> {
  allOf?: JSONSchema[];
  anyOf?: JSONSchema[];
  oneOf?: JSONSchema[];
  not?: JSONSchema;

  if?: JSONSchema;
  then?: JSONSchema;
  else?: JSONSchema;
}

export interface JSONSchema
  extends JSONBasicSchema<any>,
    SchemaWithOutCommonTypes<JSONObjectSchema>,
    SchemaWithOutCommonTypes<JSONArraySchema>,
    SchemaWithOutCommonTypes<JSONStringSchema>,
    SchemaWithOutCommonTypes<JSONNumberSchema>,
    SchemaWithOutCommonTypes<JSONConditionalSchema> {}
