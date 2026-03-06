import { z } from "zod";

export const profileUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional().nullable(),
  postcode: z.string().max(10).optional().nullable(),
});

export const comparisonSchema = z.object({
  category: z.enum(["energy", "broadband", "mobile", "insurance", "finance", "business"]).default("energy"),
  subcategory: z.string().max(50).optional(),
  postcode: z.string().max(10).optional(),
  sortBy: z.enum(["price", "rating", "popularity", "savings"]).default("price"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
  filters: z.object({
    minPrice: z.string().optional(),
    maxPrice: z.string().optional(),
    greenOnly: z.boolean().optional(),
    tariffType: z.string().optional(),
    provider: z.string().optional(),
    minSpeed: z.string().optional(),
    contractLength: z.string().optional(),
  }).optional().default({}),
});

export const alertToggleSchema = z.object({
  isActive: z.boolean(),
});

export const searchSchema = z.object({
  q: z.string().min(2).max(200),
});
