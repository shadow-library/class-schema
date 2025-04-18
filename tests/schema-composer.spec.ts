/**
 * Importing npm packages
 */
import { describe, expect, it } from 'bun:test';

/**
 * Importing user defined packages
 */
import { SchemaComposer } from '@lib/schema-composer';
import { ClassSchema, Field, Schema } from '@shadow-library/class-schema';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('Schema Composer', () => {
  @Schema({ $id: NativeUser.name })
  class NativeUser {
    @Field({ const: 'native' })
    type: 'native';

    @Field()
    username: string;

    @Field()
    password: string;
  }

  @Schema({ $id: OAuthUser.name })
  class OAuthUser {
    @Field({ const: 'oauth' })
    type: 'oauth';

    @Field()
    username: string;

    @Field()
    provider: string;
  }

  @Schema({ $id: Account.name })
  class Account {
    @Field()
    id: string;

    @Field(() => SchemaComposer.oneOf(NativeUser, OAuthUser))
    admin: NativeUser | OAuthUser;

    @Field(() => [SchemaComposer.discriminator('type', NativeUser, OAuthUser)])
    users: (NativeUser | OAuthUser)[];
  }

  const nativeUserSchema = {
    $id: NativeUser.name,
    type: 'object',
    required: ['type', 'username', 'password'],
    properties: {
      type: { type: 'string', const: 'native' },
      password: { type: 'string' },
      username: { type: 'string' },
    },
  };
  const oauthUserSchema = {
    $id: OAuthUser.name,
    type: 'object',
    required: ['type', 'username', 'provider'],
    properties: {
      type: { type: 'string', const: 'oauth' },
      provider: { type: 'string' },
      username: { type: 'string' },
    },
  };

  it('should generate the schema for anyOf', () => {
    const User = SchemaComposer.anyOf(NativeUser, OAuthUser);
    const schema = new ClassSchema(User);
    expect(schema.getJSONSchema()).toStrictEqual({
      $id: `class-schema:anyOf?Classes=${encodeURIComponent('NativeUser,OAuthUser')}`,
      type: 'object',
      anyOf: [{ $ref: NativeUser.name }, { $ref: OAuthUser.name }],
      definitions: { [NativeUser.name]: nativeUserSchema, [OAuthUser.name]: oauthUserSchema },
    });
  });

  it('should generate the schema for oneOf', () => {
    const User = SchemaComposer.oneOf(NativeUser, OAuthUser);
    const schema = new ClassSchema(User);
    expect(schema.getJSONSchema()).toStrictEqual({
      $id: `class-schema:oneOf?Classes=${encodeURIComponent('NativeUser,OAuthUser')}`,
      type: 'object',
      oneOf: [{ $ref: NativeUser.name }, { $ref: OAuthUser.name }],
      definitions: { [NativeUser.name]: nativeUserSchema, [OAuthUser.name]: oauthUserSchema },
    });
  });

  it('should generate the schema for discriminator', () => {
    const User = SchemaComposer.discriminator('type', NativeUser, OAuthUser);
    const schema = new ClassSchema(User);
    expect(schema.getJSONSchema()).toStrictEqual({
      $id: `class-schema:oneOf?Classes=${encodeURIComponent('NativeUser,OAuthUser')}&discriminatorKey=type`,
      type: 'object',
      oneOf: [{ $ref: NativeUser.name }, { $ref: OAuthUser.name }],
      discriminator: { propertyName: 'type' },
      definitions: { [NativeUser.name]: nativeUserSchema, [OAuthUser.name]: oauthUserSchema },
    });
  });

  it('should generate the schema for discriminator in a nested field', () => {
    const schema = new ClassSchema(Account);
    expect(schema.getJSONSchema()).toStrictEqual({
      $id: Account.name,
      type: 'object',
      properties: {
        id: { type: 'string' },
        admin: { $ref: 'class-schema:oneOf?Classes=NativeUser%2COAuthUser' },
        users: { type: 'array', items: { $ref: 'class-schema:oneOf?Classes=NativeUser%2COAuthUser&discriminatorKey=type' } },
      },
      required: ['id', 'admin', 'users'],
      definitions: {
        'class-schema:oneOf?Classes=NativeUser%2COAuthUser': {
          $id: 'class-schema:oneOf?Classes=NativeUser%2COAuthUser',
          type: 'object',
          oneOf: [{ $ref: 'NativeUser' }, { $ref: 'OAuthUser' }],
        },
        'class-schema:oneOf?Classes=NativeUser%2COAuthUser&discriminatorKey=type': {
          $id: 'class-schema:oneOf?Classes=NativeUser%2COAuthUser&discriminatorKey=type',
          type: 'object',
          discriminator: { propertyName: 'type' },
          oneOf: [{ $ref: 'NativeUser' }, { $ref: 'OAuthUser' }],
        },
        NativeUser: {
          $id: 'NativeUser',
          type: 'object',
          required: ['type', 'username', 'password'],
          properties: {
            type: { type: 'string', const: 'native' },
            username: { type: 'string' },
            password: { type: 'string' },
          },
        },
        OAuthUser: {
          $id: 'OAuthUser',
          type: 'object',
          required: ['type', 'username', 'provider'],
          properties: {
            type: { type: 'string', const: 'oauth' },
            username: { type: 'string' },
            provider: { type: 'string' },
          },
        },
      },
    });
  });
});
