/**
 * Importing npm packages
 */
import { Class } from 'type-fest';

/**
 * Importing user defined packages
 */
import { ClassSchema } from './class-schema';
import { SCHEMA_OPTIONS_METADATA } from './constants';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export class SchemaRegistry {
  private readonly schemas: Map<string, ClassSchema>;

  constructor() {
    this.schemas = new Map();
  }

  private getSchemaId(Class: Class<unknown>): string {
    const options = Reflect.getMetadata(SCHEMA_OPTIONS_METADATA, Class) ?? {};
    return options.$id ?? Class.name;
  }

  addSchema(Class: Class<unknown>): this {
    const id = this.getSchemaId(Class);
    if (!this.schemas.has(id)) this.schemas.set(id, new ClassSchema(Class));
    return this;
  }

  getSchema(Class: Class<unknown>): ClassSchema {
    const id = this.getSchemaId(Class);
    if (!this.schemas.has(id)) this.addSchema(Class);
    return this.schemas.get(id) as ClassSchema;
  }
}