// Base API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Shoe related types
export interface Shoe {
  _id: string;
  name: string;
  brand: string;
  modelName?: string | undefined;
  variantLabel?: string | undefined;
  parentModelId?: string | undefined;
  imageUrl?: string | undefined;
  slug?: string | undefined;
  gender?: 'men' | 'women' | 'kids' | 'unisex' | undefined;
  aggressiveness: string;
  stiffness: string;
  climbingDiscipline: string;
  volume: string;
  rubberTechnologyId?: string | undefined;
  rubberTechnology?: RubberTechnology | null | undefined;
}

export interface RubberTechnology {
  _id: string;
  brand: string;
  compound: string;
  stickiness: string;
  durability: string;
}

export interface FootShapeCompat {
  _id: string;
  shoeId: string;
  footShape: string;
}

// User shoe stash types
export interface UserShoe {
  _id: string;
  shoeId: string;
  shoe?: Shoe | undefined;
  shoeDetails?: {
    _id: string;
    name: string;
    brand: string;
    modelName: string;
    variantLabel?: string | undefined;
    parentModelId?: string | undefined;
    imageUrl?: string | undefined;
    slug?: string | undefined;
    gender?: "men" | "women" | "kids" | "unisex" | undefined;
  };
  size?: string | undefined;
  purchaseDate?: string | undefined;
  condition?: string | undefined;
  notes?: string | undefined;
  comfortScore?: number | undefined;
  performanceRating?: number | undefined;
  durabilityRating?: number | undefined;
  isFavourite?: boolean | undefined;
}

export interface CreateUserShoeRequest {
  shoeId: string;
  size?: string | undefined;
  purchaseDate?: string | undefined;
  condition?: string | undefined;
  notes?: string | undefined;
  comfortScore?: number | undefined;
  performanceRating?: number | undefined;
  durabilityRating?: number | undefined;
}

export interface UpdateUserShoeRequest {
  size?: string | undefined;
  purchaseDate?: string | undefined;
  condition?: string | undefined;
  notes?: string | undefined;
  comfortScore?: number | undefined;
  performanceRating?: number | undefined;
  durabilityRating?: number | undefined;
}

// User types
export interface User {
  id: string;
  email: string;
  name?: string | undefined;
  isAdmin?: boolean | undefined;
  createdAt: string;
}

export interface Session {
  user: User;
  session: {
    id: string;
    expiresAt: string;
    token: string;
    userId: string;
  };
}

// ImageKit types
export interface ImageKitAuthResponse {
  token: string;
  expire: number;
  signature?: string;
}

export interface ImageKitUploadOptions {
  file: File;
  fileName: string;
  folder?: string;
  useUniqueFileName?: boolean;
  tags?: string[];
}

// Search and filter types
export interface ShoeSearchParams {
  searchTerm?: string;
  brand?: string;
  climbingDiscipline?: string;
  aggressiveness?: string;
  stiffness?: string;
  volume?: string;
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

// Request/response types for API endpoints
export type GetStashResponse = ApiResponse<UserShoe[]>;
export type AddToStashResponse = ApiResponse<UserShoe>;
export type UpdateStashItemResponse = ApiResponse<UserShoe>;
export type RemoveFromStashResponse = ApiResponse<null>;
