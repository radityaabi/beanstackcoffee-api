import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { z } from "@hono/zod-openapi";
import { prisma } from "../../lib/prisma";
import { createSlug } from "../common/utils";
import {
  ProductSchema,
  ProductsSchema,
  GetProductParamSchema,
  GetProductByIdParamSchema,
  CreateProductSchema,
  UpdateProductSchema,
  ProductQuerySchema,
} from "./schema-type";

export const productRoute = new OpenAPIHono();

const tags = ["Products"];

// ─── GET /products ── List with pagination, filtering, searching ───
const getProductsRoute = createRoute({
  method: "get",
  path: "/",
  tags,
  summary: "Get all products",
  description:
    "Retrieve a paginated list of products with optional filtering, searching, and sorting.",
  request: {
    query: ProductQuerySchema,
  },
  responses: {
    200: {
      description: "Paginated list of products",
      headers: z.object({
        Link: z.string().openapi({
          description:
            "Pagination links (first, prev, next, last) in GitHub style",
          example:
            '<http://example.com/products?page=1>; rel="first", <http://example.com/products?page=2>; rel="next">',
        }),
        "X-Total-Count": z.string().openapi({
          description: "Total number of products matching the query",
          example: "50",
        }),
        "X-Total-Pages": z.string().openapi({
          description: "Total number of pages available",
          example: "5",
        }),
      }),
      content: { "application/json": { schema: ProductsSchema } },
    },
  },
});

productRoute.openapi(getProductsRoute, async (c) => {
  const query = c.req.valid("query");

  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));
  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {};

  // Search by name or description
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } },
    ];
  }

  // Filter by coffee type (supports multiple comma-separated values)
  if (query.type) {
    const types = query.type
      .split(",")
      .map((t: string) => t.trim().toUpperCase());
    where.type = types.length === 1 ? types[0] : { in: types };
  }

  // Filter by price range
  if (query.minPrice || query.maxPrice) {
    where.price = {};
    if (query.minPrice) where.price.gte = parseInt(query.minPrice);
    if (query.maxPrice) where.price.lte = parseInt(query.maxPrice);
  }

  // Filter by weight range (grams)
  if (query.minWeight || query.maxWeight) {
    where.weight = {};
    if (query.minWeight) where.weight.gte = parseInt(query.minWeight);
    if (query.maxWeight) where.weight.lte = parseInt(query.maxWeight);
  }

  // Build orderBy
  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder || "desc";
  const orderBy = { [sortBy]: sortOrder };

  const products = await prisma.product.findMany({
    where,
    orderBy,
    skip,
    take: limit,
  });

  const totalItems =
    products.length < limit
      ? skip + products.length
      : await prisma.product.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  // Build Link header with pagination
  const url = new URL(c.req.url);
  const baseUrl = `${url.origin}${url.pathname}`;

  const paramsBase = new URLSearchParams(
    Object.entries(query)
      .filter(
        ([key, variable]) =>
          key !== "page" &&
          key !== "limit" &&
          variable !== undefined &&
          variable !== null &&
          variable !== "",
      )
      .map(([key, variable]) => [key, String(variable)]),
  );

  paramsBase.set("limit", String(limit));

  const buildLink = (p: number) => {
    const params = new URLSearchParams(paramsBase); // clone
    params.set("page", String(p));
    return `<${baseUrl}?${params.toString()}>`;
  };

  const links: string[] = [
    `${buildLink(1)}; rel="first"`,
    ...(page > 1 ? [`${buildLink(page - 1)}; rel="prev"`] : []),
    ...(page < totalPages ? [`${buildLink(page + 1)}; rel="next"`] : []),
    `${buildLink(totalPages)}; rel="last"`,
  ];

  c.header("Link", links.join(", "));
  c.header("X-Total-Count", String(totalItems));
  c.header("X-Total-Pages", String(totalPages));

  return c.json(products, 200);
});

// ─── GET /products/:slug ── Get product by slug ───
const getProductBySlugRoute = createRoute({
  method: "get",
  path: "/{slug}",
  tags,
  summary: "Get product by slug",
  request: {
    params: GetProductParamSchema,
  },
  responses: {
    200: {
      description: "Product details",
      content: { "application/json": { schema: ProductSchema } },
    },
    404: { description: "Product not found" },
  },
});

productRoute.openapi(getProductBySlugRoute, async (c) => {
  const { slug } = c.req.valid("param");

  const product = await prisma.product.findUnique({ where: { slug } });

  if (!product) {
    return c.json({ error: "Product not found" }, 404);
  }

  return c.json(
    {
      ...product,
    },
    200,
  );
});

// ─── POST /products ── Add new product ───
const createProductRoute = createRoute({
  method: "post",
  path: "/",
  tags,
  summary: "Add new product",
  request: {
    body: {
      content: { "application/json": { schema: CreateProductSchema } },
    },
  },
  responses: {
    201: {
      description: "Product created successfully",
      content: { "application/json": { schema: ProductSchema } },
    },
    409: { description: "Product with this name or SKU already exists" },
  },
});

productRoute.openapi(createProductRoute, async (c) => {
  const payload = c.req.valid("json");

  const slug = createSlug(payload.name);

  try {
    const product = await prisma.product.create({
      data: { ...payload, slug },
    });

    return c.json(
      {
        ...product,
      },
      201,
    );
  } catch (error: any) {
    if (error?.code === "P2002") {
      return c.json(
        { error: "Product with this name or SKU already exists" },
        409,
      );
    }
    throw error;
  }
});

// ─── DELETE /products/:id ── Delete product by id ───
const deleteProductRoute = createRoute({
  method: "delete",
  path: "/{id}",
  tags,
  summary: "Delete product by id",
  request: {
    params: GetProductByIdParamSchema,
  },
  responses: {
    200: { description: "Product deleted successfully" },
    404: { description: "Product not found" },
    500: { description: "Failed to delete product" },
  },
});

productRoute.openapi(deleteProductRoute, async (c) => {
  const { id } = c.req.valid("param");

  try {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return c.json({ error: "Product not found" }, 404);
    }

    await prisma.product.delete({ where: { id } });

    return c.json({ message: "Product deleted successfully" }, 200);
  } catch (error) {
    return c.json({ error: "Failed to delete product" }, 500);
  }
});

// ─── PUT /products/:id ── Update product by id (full replace) ───
const updateProductRoute = createRoute({
  method: "put",
  path: "/{id}",
  tags,
  summary: "Update product by id",
  request: {
    params: GetProductByIdParamSchema,
    body: {
      content: { "application/json": { schema: CreateProductSchema } },
    },
  },
  responses: {
    200: {
      description: "Product updated successfully",
      content: { "application/json": { schema: ProductSchema } },
    },
    404: { description: "Product not found" },
    409: { description: "Conflict with existing product" },
  },
});

productRoute.openapi(updateProductRoute, async (c) => {
  const { id } = c.req.valid("param");
  const payload = c.req.valid("json");

  try {
    const product = await prisma.product.update({
      where: { id },
      data: { ...payload, slug: createSlug(payload.name) },
    });

    return c.json(ProductSchema.parse(product), 200);
  } catch (error: any) {
    if (error?.code === "P2025")
      return c.json({ error: "Product not found" }, 404);
    if (error?.code === "P2002")
      return c.json({ error: "Conflict with existing product" }, 409);
    throw error;
  }
});

// ─── PATCH /products/:id ── Partial update product by id ───
const patchProductRoute = createRoute({
  method: "patch",
  path: "/{id}",
  tags,
  summary: "Partial update product by id",
  request: {
    params: GetProductByIdParamSchema,
    body: {
      content: { "application/json": { schema: UpdateProductSchema } },
    },
  },
  responses: {
    200: {
      description: "Product updated successfully",
      content: { "application/json": { schema: ProductSchema } },
    },
    404: { description: "Product not found" },
    409: { description: "Conflict with existing product" },
  },
});

productRoute.openapi(patchProductRoute, async (c) => {
  const { id } = c.req.valid("param");
  const payload = c.req.valid("json");

  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...payload,
        ...(payload.name && { slug: createSlug(payload.name) }),
      },
    });

    return c.json(ProductSchema.parse(product), 200);
  } catch (error: any) {
    if (error?.code === "P2025")
      return c.json({ error: "Product not found" }, 404);
    if (error?.code === "P2002")
      return c.json({ error: "Conflict with existing product" }, 409);
    throw error;
  }
});
