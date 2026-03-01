import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { prisma } from "../../lib/prisma";
import { authMiddleware } from "../../lib/auth";
import {
  CartSchema,
  CartItemSchema,
  AddToCartSchema,
  UpdateCartItemSchema,
  CartItemParamSchema,
} from "./schema";

export const cartRoute = new OpenAPIHono();

const tags = ["Cart"];

// Apply auth middleware to all cart routes
cartRoute.use("/*", authMiddleware);

// Helper: get or create cart for user
async function getOrCreateCart(userId: string) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: { product: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: { product: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  return cart;
}

// Helper: format cart for response
function formatCart(cart: any) {
  return {
    id: cart.id,
    userId: cart.userId,
    items: cart.items.map((item: any) => ({
      id: item.id,
      productId: item.productId,
      product: {
        id: item.product.id,
        slug: item.product.slug,
        name: item.product.name,
        sku: item.product.sku,
        type: item.product.type,
        price: item.product.price,
        weight: item.product.weight,
        stockQuantity: item.product.stockQuantity,
        imageUrl: item.product.imageUrl,
        description: item.product.description,
      },
      quantity: item.quantity,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    })),
    createdAt: cart.createdAt.toISOString(),
    updatedAt: cart.updatedAt.toISOString(),
  };
}

// ─── GET /cart ── Get user's cart ───
const getCartRoute = createRoute({
  method: "get",
  path: "/",
  tags,
  summary: "Get user's cart",
  security: [{ Bearer: [] }],
  responses: {
    200: {
      description: "User's cart with items",
      content: { "application/json": { schema: CartSchema } },
    },
    401: { description: "Unauthorized" },
  },
});

cartRoute.openapi(getCartRoute, async (c) => {
  const userId = c.get("userId" as never) as string;
  const cart = await getOrCreateCart(userId);
  return c.json(formatCart(cart), 200);
});

// ─── PUT /cart/items ── Add product to cart ───
const addToCartRoute = createRoute({
  method: "post",
  path: "/items",
  tags,
  summary: "Add product to cart",
  description:
    "If the product already exists in the cart, its quantity will be incremented.",
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: { "application/json": { schema: AddToCartSchema } },
    },
  },
  responses: {
    200: {
      description: "Product added to cart",
      content: { "application/json": { schema: CartSchema } },
    },
    400: { description: "Product not found or insufficient stock" },
    401: { description: "Unauthorized" },
  },
});

cartRoute.openapi(addToCartRoute, async (c) => {
  const userId = c.get("userId" as never) as string;
  const { productId, quantity } = c.req.valid("json");

  // Verify product exists and has stock
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    return c.json({ error: "Product not found" }, 400);
  }

  if (product.stockQuantity < quantity) {
    return c.json(
      { error: `Insufficient stock. Available: ${product.stockQuantity}` },
      400,
    );
  }

  // Get or create cart
  let cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId } });
  }

  // Upsert cart item (add quantity if exists)
  const existingItem = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;
    if (newQuantity > product.stockQuantity) {
      return c.json(
        {
          error: `Cannot add more. Current in cart: ${existingItem.quantity}, Stock: ${product.stockQuantity}`,
        },
        400,
      );
    }
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQuantity },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity },
    });
  }

  const updatedCart = await getOrCreateCart(userId);
  return c.json(formatCart(updatedCart), 200);
});

// ─── DELETE /cart/items/:id ── Remove item from cart ───
const removeCartItemRoute = createRoute({
  method: "delete",
  path: "/items/{id}",
  tags,
  summary: "Remove item from cart",
  security: [{ Bearer: [] }],
  request: {
    params: CartItemParamSchema,
  },
  responses: {
    200: {
      description: "Item removed from cart",
      content: { "application/json": { schema: CartSchema } },
    },
    404: { description: "Cart item not found" },
    401: { description: "Unauthorized" },
  },
});

cartRoute.openapi(removeCartItemRoute, async (c) => {
  const userId = c.get("userId" as never) as string;
  const { id } = c.req.valid("param");

  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {
    return c.json({ error: "Cart not found" }, 404);
  }

  const cartItem = await prisma.cartItem.findUnique({
    where: { id, cartId: cart.id },
  });

  if (!cartItem) {
    return c.json({ error: "Cart item not found" }, 404);
  }

  await prisma.cartItem.delete({ where: { id } });

  const updatedCart = await getOrCreateCart(userId);
  return c.json(formatCart(updatedCart), 200);
});

// ─── PATCH /cart/items/:id ── Update item quantity ───
const updateCartItemRoute = createRoute({
  method: "put",
  path: "/items/{id}",
  tags,
  summary: "Update cart item quantity",
  security: [{ Bearer: [] }],
  request: {
    params: CartItemParamSchema,
    body: {
      content: { "application/json": { schema: UpdateCartItemSchema } },
    },
  },
  responses: {
    200: {
      description: "Cart item quantity updated",
      content: { "application/json": { schema: CartSchema } },
    },
    400: { description: "Insufficient stock" },
    404: { description: "Cart item not found" },
    401: { description: "Unauthorized" },
  },
});

cartRoute.openapi(updateCartItemRoute, async (c) => {
  const userId = c.get("userId" as never) as string;
  const { id } = c.req.valid("param");
  const { quantity } = c.req.valid("json");

  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {
    return c.json({ error: "Cart not found" }, 404);
  }

  const cartItem = await prisma.cartItem.findUnique({
    where: { id, cartId: cart.id },
    include: { product: true },
  });

  if (!cartItem) {
    return c.json({ error: "Cart item not found" }, 404);
  }

  if (quantity > cartItem.product.stockQuantity) {
    return c.json(
      {
        error: `Insufficient stock. Available: ${cartItem.product.stockQuantity}`,
      },
      400,
    );
  }

  await prisma.cartItem.update({
    where: { id },
    data: { quantity },
  });

  const updatedCart = await getOrCreateCart(userId);
  return c.json(formatCart(updatedCart), 200);
});
