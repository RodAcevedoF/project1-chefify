import type { HydratedDocument } from "mongoose";
import type { IUser } from "../../src/schemas";
import { jest } from "bun:test";

export function createMockUserDoc(
  user: Partial<IUser>
): HydratedDocument<IUser> {
  return {
    ...user,
    _id: "mock-id",
    save: jest.fn(),
    isModified: jest.fn(),
    $isDeleted: false,
    $locals: {},
    $op: null,
    $where: {},
    collection: {} as any,
    db: {} as any,
    errors: undefined,
    id: "mock-id",
    init: jest.fn(),
    invalidate: jest.fn(),
    isDirectModified: jest.fn(),
    isInit: jest.fn(),
    isSelected: jest.fn(),
    markModified: jest.fn(),
    modifiedPaths: jest.fn(),
    overwrite: jest.fn(),
    populate: jest.fn(),
    remove: jest.fn(),
    replaceOne: jest.fn(),
    toJSON: jest.fn(),
    toObject: jest.fn(),
    unmarkModified: jest.fn(),
    update: jest.fn(),
    validate: jest.fn(),
    validateSync: jest.fn(),
    $ignore: jest.fn(),
    __v: 0,
  } as unknown as HydratedDocument<IUser>;
}
