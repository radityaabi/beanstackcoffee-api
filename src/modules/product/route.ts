import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { prisma } from "../../lib/prisma";
import { createSlug } from "../common/utils";
import {
  ProductSchema,
  PaginatedProductsSchema,
  GetProductParamSchema,
  GetProductByIdParamSchema,
  CreateProductSchema,
  UpdateProductSchema,
  ProductQuerySchema,
} from "./schema";

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
      content: { "application/json": { schema: PaginatedProductsSchema } },
    },
  },
});

productRoute.openapi(getProductsRoute, async (c) => {
  const query = c.req.valid("query");

  const page = Math.max(1, parseInt(query.page || "1"));
  const limit = Math.min(50, Math.max(1, parseInt(query.limit || "10")));
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
    const types = query.type.split(",").map((t: string) => t.trim());
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

  const [products, totalItems] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return c.json(
    {
      data: products.map((product) => ({
        ...product,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      })),
      pagination: { page, limit, totalItems, totalPages },
    },
    200,
  );
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
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
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
  const body = c.req.valid("json");

  const slug = createSlug(body.name);

  try {
    const product = await prisma.product.create({
      data: { ...body, slug },
    });

    return c.json(
      {
        ...product,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
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
  },
});

productRoute.openapi(deleteProductRoute, async (c) => {
  const { id } = c.req.valid("param");

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return c.json({ error: "Product not found" }, 404);
  }

  await prisma.product.delete({ where: { id } });

  return c.json({ message: "Product deleted successfully" }, 200);
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
  const body = c.req.valid("json");

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return c.json({ error: "Product not found" }, 404);
  }

  const slug = createSlug(body.name);

  try {
    const product = await prisma.product.update({
      where: { id },
      data: { ...body, slug },
    });

    return c.json(
      {
        ...product,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      },
      200,
    );
  } catch (error: any) {
    if (error?.code === "P2002") {
      return c.json({ error: "Conflict with existing product" }, 409);
    }
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
  const body = c.req.valid("json");

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return c.json({ error: "Product not found" }, 404);
  }

  const updateData: any = { ...body };
  if (body.name) {
    updateData.slug = createSlug(body.name);
  }

  try {
    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    return c.json(
      {
        ...product,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      },
      200,
    );
  } catch (error: any) {
    if (error?.code === "P2002") {
      return c.json({ error: "Conflict with existing product" }, 409);
    }
    throw error;
  }
});
