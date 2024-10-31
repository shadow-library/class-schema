/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { Schema } from '@shadow-library/class-schema';
import { SCHEMA_OPTIONS_METADATA } from '@lib/constants';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('@Schema', () => {
  it('should decorate the class with schema options', () => {
    @Schema({ $id: 'id', patternProperties: {} })
    class Sample {}

    const options = Reflect.getMetadata(SCHEMA_OPTIONS_METADATA, Sample);
    expect(options).toStrictEqual({ $id: 'id', patternProperties: {} });
  });

  it('should set the default $id field', () => {
    @Schema()
    class Sample {}

    const options = Reflect.getMetadata(SCHEMA_OPTIONS_METADATA, Sample);
    expect(options).toStrictEqual({ $id: expect.stringMatching(/^class-schema:\/\/Sample-[0-9]$/) });
  });

  it('should set different $id field for schema having same name', () => {
    function getClass() {
      @Schema()
      class Sample {}
      return Sample;
    }

    const ClassOne = getClass();
    const ClassTwo = getClass();
    const classOneOptions = Reflect.getMetadata(SCHEMA_OPTIONS_METADATA, ClassOne);
    const classTwoOptions = Reflect.getMetadata(SCHEMA_OPTIONS_METADATA, ClassTwo);
    expect(classOneOptions.$id).not.toBe(classTwoOptions.$id);
  });
});
