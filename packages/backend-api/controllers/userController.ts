import { Context } from "hono";
import { userService } from "../services/user.service";
import { resultAsyncToHonoResponse } from "../utils/response";
import {
  UnauthenticatedError,
  ValidationError,
  NotFoundError,
  UnexpectedError,
  AppError,
} from "../src/lib/errors";
import { err, ResultAsync } from "neverthrow";

export const getUsers = async (c: Context): Promise<Response> => {
  const result = await ResultAsync.fromPromise(
    Promise.resolve([]), // TODO: Replace with Convex when ready
    (error: any) => new UnexpectedError("Failed to fetch users"),
  );

  return resultAsyncToHonoResponse(c, Promise.resolve(result));
};

export const getUserById = async (c: Context): Promise<Response> => {
  const id = c.req.param("id");
  if (!id) {
    return resultAsyncToHonoResponse(
      c,
      Promise.resolve(err(new ValidationError("User ID is required"))),
    );
  }

  const result = await ResultAsync.fromPromise(
    Promise.reject(new NotFoundError("User not found")), // TODO: Replace with Convex query
    (error: any) =>
      error instanceof AppError
        ? error
        : new UnexpectedError("Failed to fetch user"),
  );

  return resultAsyncToHonoResponse(c, Promise.resolve(result));
};

export const getProfile = async (c: Context): Promise<Response> => {
  const user = c.get("user");
  if (!user || !user.id) {
    return resultAsyncToHonoResponse(
      c,
      Promise.resolve(
        err(new UnauthenticatedError("User not found in context")),
      ),
    );
  }

  const result = await userService.getUserById(user.id);
  return resultAsyncToHonoResponse(c, Promise.resolve(result));
};

export const editProfile = async (c: Context): Promise<Response> => {
  const user = c.get("user");
  if (!user || !user.id) {
    return resultAsyncToHonoResponse(
      c,
      Promise.resolve(
        err(new UnauthenticatedError("User not found in context")),
      ),
    );
  }

  const body = await c.req.json();
  const updateFields: Record<string, any> = {};
  if (typeof body.name === "string" && body.name !== "")
    updateFields.name = body.name;
  if (typeof body.phone === "string" && body.phone !== "")
    updateFields.phone = body.phone;
  if (typeof body.image === "string" && body.image !== "")
    updateFields.image = body.image;
  if (typeof body.footShape === "string" && body.footShape !== "")
    updateFields.footShape = body.footShape;
  if (typeof body.footVolume === "string" && body.footVolume !== "")
    updateFields.footVolume = body.footVolume;

  if (Object.keys(updateFields).length === 0) {
    return resultAsyncToHonoResponse(
      c,
      Promise.resolve(err(new ValidationError("No fields to update"))),
    );
  }

  const result = await userService.updateProfile(user.id, updateFields);
  return resultAsyncToHonoResponse(c, Promise.resolve(result));
};

export const completeOnboarding = async (c: Context): Promise<Response> => {
  const user = c.get("user");
  if (!user || !user.id) {
    return resultAsyncToHonoResponse(
      c,
      Promise.resolve(
        err(new UnauthenticatedError("User not found in context")),
      ),
    );
  }

  const body = await c.req.json();
  const { footShape, favoriteShoeId } = body;

  const result = await userService.completeOnboarding(
    user.id,
    footShape,
    favoriteShoeId,
  );
  return resultAsyncToHonoResponse(c, Promise.resolve(result));
};

export const getShoes = async (c: Context): Promise<Response> => {
  const result = await ResultAsync.fromPromise(
    Promise.resolve([]), // TODO: Replace with actual Convex query
    (error: any) => new UnexpectedError("Failed to fetch shoes"),
  );

  return resultAsyncToHonoResponse(c, Promise.resolve(result));
};

export const getUsersCount = async (c: Context): Promise<Response> => {
  const result = await ResultAsync.fromPromise(
    Promise.resolve({ count: 0 }),
    () => new UnexpectedError("Failed to fetch users count"),
  );

  return resultAsyncToHonoResponse(c, Promise.resolve(result));
};
