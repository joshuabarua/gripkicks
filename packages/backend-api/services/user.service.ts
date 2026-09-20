import { Result, err, ok } from 'neverthrow';
import {
  AppError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
  InvalidDataError,
  UnauthenticatedError,
  UnexpectedError
} from '../src/lib/errors';
import { callConvex } from '../utils/convexClient';

interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  footShape?: string;
  footVolume?: string;
  onboardingComplete?: boolean;
  favoriteShoe?: any;
}

interface SessionUser {
  id: string;
  email: string;
  name?: string;
  image?: string;
  emailVerified?: boolean;
}

interface UpdateProfileData {
  name?: string;
  phone?: string;
  image?: string;
  footShape?: string;
  footVolume?: string;
  favoriteShoeId?: string | null;
}

class UserService {
  async getUsers(): Promise<Result<User[], AppError>> {
    try {
      return ok(await this.findUsers());
    } catch {
      return err(new UnexpectedError('Failed to fetch users'));
    }
  }

  async getUserById(id: string, sessionUser?: SessionUser): Promise<Result<User, AppError>> {
    if (!id) {
      return err(new ValidationError('User ID is required'));
    }

    try {
      let user = await this.findUserById(id);

      if (!user && sessionUser) {
        console.log('[UserService] User not found in Convex; syncing from session:', sessionUser.id);
        await this.syncUserToConvex(sessionUser);
        user = await this.findUserById(id);
      }

      if (!user) {
        return err(new NotFoundError('User not found'));
      }
      return ok(user);
    } catch (error) {
      // Different error types based on context
      if (error instanceof TypeError) {
        return err(new InvalidDataError('Invalid user data format'));
      }
      return err(new UnexpectedError('Failed to fetch user due to unexpected error'));
    }
  }

  async updateProfile(
    userId: string,
    data: UpdateProfileData,
    sessionUser?: SessionUser
  ): Promise<Result<User, AppError>> {
    // Check authentication
    if (!userId) {
      return err(new UnauthenticatedError('User must be authenticated to update profile'));
    }

    const validation = this.validateUpdateData(data);
    if (validation.isErr()) {
      return err(validation.error);
    }

    // Validate data integrity
    const dataValidation = this.validateDataIntegrity(data);
    if (dataValidation.isErr()) {
      return err(dataValidation.error);
    }

    try {
      const updatedUser = await this.performUpdate(userId, data, sessionUser);
      return ok(updatedUser);
    } catch (error) {
      if (error instanceof RangeError) {
        return err(new InvalidDataError('Data values out of valid range'));
      }
      return err(new UnexpectedError('Failed to update profile'));
    }
  }

  async completeOnboarding(
    userId: string,
    footShape?: string,
    favoriteShoeId?: string
  ): Promise<Result<User, AppError>> {
    // Authentication check
    if (!userId) {
      return err(new UnauthenticatedError('User must be authenticated'));
    }

    if (footShape && !this.isValidFootShape(footShape)) {
      return err(new InvalidDataError('Invalid foot shape provided'));
    }

    try {
      const user = await this.updateOnboardingStatus(userId, footShape, favoriteShoeId);
      return ok(user);
    } catch (error) {
      return err(new UnexpectedError('Failed to complete onboarding'));
    }
  }

  async deleteUser(userId: string, requesterId: string): Promise<Result<void, AppError>> {
    // Authentication check
    if (!requesterId) {
      return err(new UnauthenticatedError('Authentication required'));
    }

    // Authorization check
    if (userId !== requesterId) {
      const isAdmin = await this.checkIsAdmin(requesterId);
      if (!isAdmin) {
        return err(new UnauthorizedError('You can only delete your own account'));
      }
    }

    try {
      await this.performDelete(userId);
      return ok(undefined);
    } catch (error) {
      return err(new UnexpectedError('Failed to delete user'));
    }
  }

  private validateUpdateData(data: UpdateProfileData): Result<void, ValidationError> {
    const hasValidFields = Object.values(data).some((value) => value !== undefined);

    if (!hasValidFields) {
      return err(new ValidationError('No valid fields to update'));
    }

    return ok(undefined);
  }

  private validateDataIntegrity(data: UpdateProfileData): Result<void, InvalidDataError> {
    // Check for invalid data patterns
    if (data.phone && !/^\+?[\d\s-()]+$/.test(data.phone)) {
      return err(new InvalidDataError('Invalid phone number format'));
    }

    if (data.image && !this.isValidUrl(data.image)) {
      return err(new InvalidDataError('Invalid image URL format'));
    }

    if (data.name && data.name.length > 100) {
      return err(new InvalidDataError('Name too long (max 100 characters)'));
    }

    if (data.footShape && !this.isValidFootShape(data.footShape)) {
      return err(new InvalidDataError('Invalid foot shape. Must be one of: egyptian, roman, greek, germanic, celtic'));
    }

    if (data.footVolume && !this.isValidFootVolume(data.footVolume)) {
      return err(new InvalidDataError('Invalid foot volume. Must be one of: low, medium, high'));
    }

    if (
      data.favoriteShoeId !== undefined &&
      data.favoriteShoeId !== null &&
      typeof data.favoriteShoeId !== "string"
    ) {
      return err(new InvalidDataError("Invalid favorite shoe id"));
    }

    return ok(undefined);
  }

  private isValidFootShape(shape: string): boolean {
    const validShapes = ['egyptian', 'roman', 'greek', 'germanic', 'celtic'];
    return validShapes.includes(shape);
  }

  private isValidFootVolume(volume: string): boolean {
    const validVolumes = ['low', 'medium', 'high'];
    return validVolumes.includes(volume);
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private mapUserFromConvex(user: any): User {
    return {
      id: user._id,
      email: user.email,
      name: user.name,
      image: user.image,
      footShape: user.footShape,
      footVolume: user.footVolume,
    };
  }

  private async findUsers(): Promise<User[]> {
    const users = await callConvex<unknown>('/api/users/list');

    if (!Array.isArray(users)) {
      throw new Error('Invalid users response from Convex');
    }

    return users.map((user: unknown) => this.mapUserFromConvex(user));
  }

  private async findUserById(id: string): Promise<User | null> {
    try {
      const user = await callConvex<any>('/api/users/findByBetterAuthId', {
        betterAuthId: id,
      });

      if (!user) {
        return null;
      }

      return {
        id: user._id,
        email: user.email,
        name: user.name,
        image: user.image,
        footShape: user.footShape,
        footVolume: user.footVolume,
        onboardingComplete: user.onboardingComplete,
        favoriteShoe: user.favoriteShoe,
      };
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      return null;
    }
  }

  private async syncUserToConvex(sessionUser: SessionUser): Promise<void> {
    await callConvex('/api/sync-user-deduplicated', {
      betterAuthId: sessionUser.id,
      email: sessionUser.email,
      name: sessionUser.name,
      image: sessionUser.image,
      emailVerified: sessionUser.emailVerified ?? false,
    });
  }

  private async performUpdate(
    userId: string,
    data: UpdateProfileData,
    sessionUser?: SessionUser
  ): Promise<User> {
    try {
      let existingUser = await this.findUserById(userId);

      if (!existingUser && sessionUser) {
        console.log('[UserService] User not found in Convex; syncing from session:', sessionUser.id);
        await this.syncUserToConvex(sessionUser);
        existingUser = await this.findUserById(userId);
      }

      if (!existingUser) {
        throw new Error('User not found for profile update');
      }

      const user = await callConvex<any>('/api/users/update', {
        id: userId,
        ...data,
      });

      return this.mapUserFromConvex(user);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  private async updateOnboardingStatus(
    userId: string,
    footShape?: string,
    favoriteShoeId?: string
  ): Promise<User> {
    try {
      const user = await callConvex<any>('/api/users/completeOnboarding', {
        userId,
        footShape,
        favoriteShoeId,
      });

      return this.mapUserFromConvex(user);
    } catch (error) {
      console.error('Error updating onboarding status:', error);
      throw error;
    }
  }

  private async checkIsAdmin(userId: string): Promise<boolean> {
    try {
      const user = await this.findUserById(userId);
      return (user as any)?.isAdmin === true;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  private async performDelete(userId: string): Promise<void> {
    try {
      await callConvex('/api/users/delete', { id: userId });
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
}

export const userService = new UserService();
