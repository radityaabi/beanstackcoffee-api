import { z } from "@hono/zod-openapi";

export const CoffeeTypeEnum = z.enum(["ARABICA", "ROBUSTA", "BLEND"]);

export const ProductSchema = z
  .object({
    id: z.string(),
    slug: z.string(),
    name: z.string(),
    sku: z.string(),
    type: CoffeeTypeEnum,
    price: z.number().int(),
    weight: z.number().int(),
    stockQuantity: z.number().int(),
    imageUrl: z.string().nullable(),
    description: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .openapi("Product");

export const ProductsSchema = z.array(ProductSchema);

export const GetProductParamSchema = z.object({
  slug: z.string().min(1).openapi({ example: "mens-rea-blend" }),
});

export const GetProductByIdParamSchema = z.object({
  id: z.string().min(1).openapi({ example: "01JMXYZ..." }),
});

export const CreateProductSchema = z
  .object({
    name: z.string().min(1).openapi({ example: "Mens Rea Blend" }),
    sku: z.string().min(1).openapi({ example: "CF-BEANS-001" }),
    type: CoffeeTypeEnum.openapi({ example: "BLEND" }),
    price: z.number().int().positive().openapi({ example: 149000 }),
    weight: z
      .number()
      .int()
      .positive()
      .openapi({ example: 250, description: "Weight in grams" }),
    stockQuantity: z.number().int().min(0).openapi({ example: 50 }),
    imageUrl: z.url().optional().openapi({
      example:
        "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600",
    }),
    description: z.string().optional().openapi({
      example: "A bold and complex blend...",
    }),
  })
  .openapi("CreateProduct");

export const UpdateProductSchema = z
  .object({
    name: z.string().min(1).optional(),
    sku: z.string().min(1).optional(),
    type: CoffeeTypeEnum.optional(),
    price: z.number().int().positive().optional(),
    weight: z.number().int().positive().optional(),
    stockQuantity: z.number().int().min(0).optional(),
    imageUrl: z.url().nullable().optional(),
    description: z.string().nullable().optional(),
  })
  .openapi("UpdateProduct");

export const ProductQuerySchema = z.object({
  page: z.string().optional().openapi({ example: "1" }),
  limit: z.string().optional().openapi({ example: "10" }),
  search: z.string().optional().openapi({ example: "arabica" }),
  type: z.string().optional().openapi({
    example: "ARABICA",
    description:
      "Filter by coffee type. Supports multiple values separated by commas (e.g. ARABICA,ROBUSTA). Valid values: ARABICA, ROBUSTA, BLEND",
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

export const PaginationSchema = z.object({
  page: z.number().int(),
  limit: z.number().int(),
  totalItems: z.number().int(),
  totalPages: z.number().int(),
});

export const PaginatedProductsSchema = z
  .object({
    data: ProductsSchema,
    pagination: PaginationSchema,
  })
  .openapi("PaginatedProducts");
