import { z } from "zod";

export const postcodeSchema = z
  .string()
  .regex(/^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i, "Please enter a valid UK postcode");

export const comparisonQuerySchema = z.object({
  category: z.string().min(1),
  subcategory: z.string().optional(),
  postcode: postcodeSchema.optional(),
  sortBy: z.enum(["price", "rating", "popularity", "speed", "data"]).default("price"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  page: z.number().int().positive().default(1),
  perPage: z.number().int().positive().max(50).default(20),
  filters: z.record(z.string(), z.unknown()).default({}),
});

export const energyComparisonSchema = z.object({
  postcode: postcodeSchema,
  currentSupplier: z.string().optional(),
  paymentMethod: z.enum(["direct-debit", "prepayment", "cash-cheque"]).default("direct-debit"),
  usageLevel: z.enum(["low", "medium", "high", "custom"]).default("medium"),
  customUsage: z.number().optional(),
  greenOnly: z.boolean().default(false),
  fixedOnly: z.boolean().default(false),
});

export const broadbandComparisonSchema = z.object({
  postcode: postcodeSchema,
  minSpeed: z.number().optional(),
  maxPrice: z.number().optional(),
  includeTV: z.boolean().default(false),
  contractLength: z.number().optional(),
});

export const mobileComparisonSchema = z.object({
  dealType: z.enum(["sim-only", "contract", "pay-as-you-go"]).default("sim-only"),
  minData: z.string().optional(),
  maxPrice: z.number().optional(),
  network: z.string().optional(),
  includeHandset: z.boolean().default(false),
});
