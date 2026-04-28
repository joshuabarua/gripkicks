import { Hono } from "hono";
import { sign } from "jsonwebtoken";
import { protect } from "../middleware/auth.middlewares";
import type { User } from "better-auth/types";

// Define allowed ImageKit token parameters
type ImageKitTokenParams = {
  token?: string;
  expire?: number;
  signature?: string;
  [key: string]: unknown;
};

// Define the expected request body type
type ImageKitAuthRequest = {
  token?: string;
  expire?: number;
  signature?: string;
  // Add any other allowed fields from ImageKit documentation
  [key: string]: unknown;
};

// Define upload request type
type ImageUploadRequest = {
  file: File;
  fileName: string;
  folder: string;
};

const router = new Hono<{
  Variables: {
    user: User;
    session: any;
  };
}>();

function requireAuth(c: any) {
  const user = c.get("user");

  if (!user || !user.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  return user;
}

// ImageKit authentication endpoint
router.post("/imagekit", protect, async (c) => {
  try {
    const user = requireAuth(c);
    if (!user) return;

    // Get the request body for additional parameters
    const body: ImageKitAuthRequest = await c.req.json().catch(() => ({}));

    // Sanitize and validate the request body
    const allowedParams: ImageKitTokenParams = {};
    const allowedFields = ["token", "expire", "signature"]; // Add other allowed fields as needed

    for (const field of allowedFields) {
      if (field in body && body[field] !== undefined) {
        const value = body[field];
        // Type validation
        if (field === "expire" && typeof value === "number" && value > 0) {
          allowedParams[field] = value;
        } else if (field === "token" && typeof value === "string") {
          allowedParams[field] = value;
        } else if (field === "signature" && typeof value === "string") {
          allowedParams[field] = value;
        }
      }
    }

    // Generate token for ImageKit
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    if (!privateKey) {
      console.error("IMAGEKIT_PRIVATE_KEY not configured");
      return c.json({ error: "ImageKit not configured" }, 500);
    }

    // Create the token payload with only sanitized parameters
    const payload = {
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour expiry
      ...allowedParams,
    };

    // Sign the token
    const tokenString = sign(payload, privateKey, {
      algorithm: "HS256", // Use HMAC-SHA256 for ImageKit
    });

    return c.json({
      token: tokenString,
      expire: payload.exp * 1000, // Convert to milliseconds
    });
  } catch (error) {
    console.error("ImageKit auth error:", error);
    return c.json({ error: "Failed to authenticate" }, 500);
  }
});

// Image upload endpoint for ProfileImageUpload component
router.post("/upload", protect, async (c) => {
  try {
    const user = requireAuth(c);
    if (!user) return;

    const body = await c.req.json();
    const { fileName, folder } = body;

    if (!fileName || !folder) {
      return c.json({ error: "fileName and folder are required" }, 400);
    }

    // For now, return a placeholder URL since ImageKit direct upload
    // should be handled by the frontend component
    // This endpoint can be enhanced later to handle server-side uploads
    const urlEndpoint =
      process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/ie871bk0r";

    // Generate a mock URL for now - in production, this would be the actual uploaded URL
    const mockUrl = `${urlEndpoint}/${folder}/${fileName}`;

    return c.json({
      success: true,
      url: mockUrl,
    });
  } catch (error) {
    console.error("Image upload error:", error);
    return c.json({ error: "Failed to upload image" }, 500);
  }
});

export default router;
