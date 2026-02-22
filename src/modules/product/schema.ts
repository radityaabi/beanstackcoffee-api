import { z } from "@hono/zod-openapi";

export const ProductSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  sku: z.string(),
  price: z.int(),
  stockQuantity: z.int(),
  imageUrl: z.string(),
  description: z.string(),
});

export const ProductsSchema = z.array(ProductSchema);

export const GetProductParamSchema = z.object({
  slug: z
    .string()
    .min(1)
    .openapi({ example: "mens-rea-blend" }),
});