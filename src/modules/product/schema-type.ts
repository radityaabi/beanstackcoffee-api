import { z } from "@hono/zod-openapi";
import { ProductModelSchema } from "../../generated/zod/schemas";
import { CategorySchema } from "../category/schema-type";

export const ProductBaseSchema = ProductModelSchema.omit({
  cartItems: true,
  category: true,
}).extend({
  name: z.string().min(1).max(100).openapi({ example: "Mens Rea Blend" }),
  sku: z.string().min(1).max(100).openapi({ example: "CF-BEANS-001" }),
  categoryId: z.string().openapi({ example: "01JMXYZ..." }),
  category: CategorySchema,
  price: z.number().int().positive().openapi({ example: 149000 }),
  weight: z
    .number()
    .int()
    .positive()
    .openapi({ example: 250, description: "Weight in grams" }),
  stockQuantity: z.number().int().min(0).openapi({ example: 50 }),
  imageUrl: z.string().nullable().optional().openapi({
    example: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600",
  }),
  description: z.string().nullable().optional().openapi({
    example: "A bold and complex blend of Arabica and Robusta beans...",
  }),
});

export const SeedProductSchema = ProductBaseSchema.omit({
  id: true,
  slug: true,
  categoryId: true,
  category: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  categorySlug: z.string(),
});

export const SeedProductsSchema = z
  .array(SeedProductSchema)
  .openapi("SeedProduct");

export const ProductSchema = ProductBaseSchema.openapi("Product");

export const ProductsSchema = z.array(ProductSchema);

export const GetProductParamSchema = z.object({
  slug: z.string().min(1).openapi({ example: "mens-rea-blend" }),
});

export const GetProductByIdParamSchema = z.object({
  id: z.string().min(1).openapi({ example: "01JMXYZ..." }),
});

export const CreateProductSchema = ProductBaseSchema.omit({
  id: true,
  slug: true,
  category: true,
  createdAt: true,
  updatedAt: true,
}).openapi("CreateProduct");

export const UpdateProductSchema = CreateProductSchema.extend({
  sku: z.string().min(1).max(100).optional(),
  name: z.string().min(1).max(100).optional(),
  categoryId: z.string().optional(),
  price: z.number().int().positive().optional(),
  weight: z.number().int().positive().optional(),
  stockQuantity: z.number().int().min(0).optional(),
}).openapi("UpdateProduct");

export const ProductQuerySchema = z.object({
  page: z.string().optional().openapi({ example: "1" }),
  limit: z.string().optional().openapi({ example: "10" }),
  search: z.string().optional().openapi({ example: "arabica" }),
  category: z.string().optional().openapi({
    example: "arabica",
    description:
      "Filter by category slug. Supports multiple values separated by commas.",
  }),
  minPrice: z.string().optional().openapi({ example: "50000" }),
  maxPrice: z.string().optional().openapi({ example: "200000" }),
  minWeight: z
    .string()
    .optional()
    .openapi({ example: "200", description: "Minimum weight in grams" }),
  maxWeight: z
    .string()
    .optional()
    .openapi({ example: "500", description: "Maximum weight in grams" }),
  sortBy: z
    .enum(["name", "price", "weight", "createdAt"])
    .optional()
    .openapi({ example: "price" }),
  sortOrder: z.enum(["asc", "desc"]).optional().openapi({ example: "asc" }),
});

export const PaginatedProductsSchema =
  ProductsSchema.openapi("PaginatedProducts");

export type Product = z.infer<typeof ProductSchema>;
export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type SeedProduct = z.infer<typeof SeedProductSchema>;
export type SeedProducts = z.infer<typeof SeedProductsSchema>;
