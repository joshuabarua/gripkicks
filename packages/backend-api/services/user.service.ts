import { Result, ResultAsync, err, ok } from 'neverthrow';
import {
  AppError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
  InvalidDataError,
  UnauthenticatedError,
  UnexpectedError,
  RandomError
} from '../src/lib/errors';
import { getConvexUrl } from '../utils/convexHelper';

export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  footShape?: string;
  footVolume?: string;
  onboardingComplete?: boolean;
  favoriteShoe?: any;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  image?: string;
  footShape?: string;
  footVolume?: string;
  favoriteShoeId?: string | null;
}

class UserService {
  async getUserById(id: string): Promise<Result<User, AppError>> {
    if (!id) {
      return err(new ValidationError('User ID is required'));
    }

    try {
      const user = await this.findUserById(id);
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
    data: UpdateProfileData
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
      const updatedUser = await this.performUpdate(userId, data);
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

    // Authorization check (example: user must be verified)
    const isVerified = await this.checkUserVerification(userId);
    if (!isVerified) {
      return err(new UnauthorizedError('User must be verified to complete onboarding'));
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

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private async findUserById(id: string): Promise<User | null> {
    try {
      const convexUrl = getConvexUrl();
      const response = await fetch(`${convexUrl}/api/users/findByBetterAuthId`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ betterAuthId: id })
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      if (!data.data) {
        return null;
      }

      const user = data.data;
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

  private async performUpdate(userId: string, data: UpdateProfileData): Promise<User> {
    try {
      const existingUser = await this.findUserById(userId);

      if (!existingUser) {
        throw new Error('User not found for profile update');
      }

      const convexUrl = getConvexUrl();
      const response = await fetch(`${convexUrl}/api/users/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: userId,
          ...data
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to update user in database');
      }

      const result = await response.json();
      const user = result.data;

      return {
        id: user._id,
        email: user.email,
        name: user.name,
        image: user.image,
        footShape: user.footShape,
        footVolume: user.footVolume,
      };
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
      const convexUrl = getConvexUrl();
      const response = await fetch(`${convexUrl}/api/users/completeOnboarding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          footShape,
          favoriteShoeId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update onboarding status');
      }

      const result = await response.json();
      const user = result.data;

      return {
        id: user._id,
        email: user.email,
        name: user.name,
        image: user.image,
        footShape: user.footShape,
        footVolume: user.footVolume,
      };
    } catch (error) {
      console.error('Error updating onboarding status:', error);
      throw error;
    }
  }

  private async checkUserVerification(userId: string): Promise<boolean> {
    // Simulate verification check
    return true;
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
      const convexUrl = getConvexUrl();
      const response = await fetch(`${convexUrl}/api/users/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId })
      });

      if (!response.ok) {
        throw new Error('Failed to delete user from database');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
}

export const userService = new UserService();
