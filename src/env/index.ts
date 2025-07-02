import "dotenv/config"
import { z } from "zod"

const envSchema = z.object({
    NODE_ENV: z
        .enum(["development", "production"])
        .default("development"),
    PORT: z.coerce.number().default(3000),
    DATABASE_HOST: z.string(),
    DATABASE_USER: z.string(),
    DATABASE_PASSWORD: z.string(),
    DATABASE_NAME: z.string(),
    DATABASE_PORT: z.coerce.number(),
    JWT_SECRET: z.string(),
    
    // Shipping Configuration
    SHIPPING_USE_MOCK: z.string().default("true"),
    
    // UPS Configuration
    UPS_CLIENT_ID: z.string().optional(),
    UPS_CLIENT_SECRET: z.string().optional(),
    UPS_ACCOUNT_NUMBER: z.string().optional(),
    UPS_BASE_URL: z.string().default("https://wwwcie.ups.com/api"),
    
    // FedEx Configuration
    FEDEX_API_KEY: z.string().optional(),
    FEDEX_SECRET_KEY: z.string().optional(),
    FEDEX_ACCOUNT_NUMBER: z.string().optional(),
    FEDEX_BASE_URL: z.string().default("https://apis-sandbox.fedex.com"),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
    console.error("Invalid environment variables", _env.error.format());
    throw new Error("Invalid environment variables");
  }
  
  export const env = _env.data;

