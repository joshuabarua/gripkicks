// Base API response types

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

// fallow-ignore-next-line unused-type
export interface RubberTechnology {
  _id: string;
  brand: string;
  compound: string;
  stickiness: string;
  durability: string;
}

// fallow-ignore-next-line unused-type
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

// fallow-ignore-next-line unused-type
export interface User {
  id: string;
  email: string;
  name?: string | undefined;
  isAdmin?: boolean | undefined;
  createdAt: string;
}

// fallow-ignore-next-line unused-type
export interface Session {
  user: User;
  session: {
    id: string;
    expiresAt: string;
    token: string;
    userId: string;
  };
}

// Error types
// fallow-ignore-next-line unused-type
export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

