import { successResponse } from "../../src/utils";
import type { Response } from "express";
import { describe, it, expect } from "bun:test";
import { jest } from "bun:test";

describe("successResponse", () => {
  it("should respond with success: true and provided data", () => {
    const jsonMock = jest.fn();
    const statusMock = jest.fn(() => ({ json: jsonMock }));

    const res = { status: statusMock } as unknown as Response;
    const data = { msg: "Hello world" };

    successResponse(res, data, 201);

    expect(statusMock).toHaveBeenCalledWith(201);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      data
    });
  });

  it("should default to status code 200 when not provided", () => {
    const jsonMock = jest.fn();
    const statusMock = jest.fn(() => ({ json: jsonMock }));

    const res = { status: statusMock } as unknown as Response;
    const data = "Simple message";

    successResponse(res, data);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      data
    });
  });
});
