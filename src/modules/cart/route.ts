import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { prisma } from "../../lib/prisma";
import { checkAuthMiddleware } from "../auth/middleware";
import {
  CartSchema,
  AddToCartSchema,
  UpdateCartItemSchema,
  CartItemParamSchema,
} from "./schema-type";

export const cartRoute = new OpenAPIHono();

const tags = ["Cart"];

// Apply auth middleware to all cart routes
cartRoute.use("/*", checkAuthMiddleware);

// Helper: get or create cart for user
async function getOrCreateCart(userId: string) {
  try {
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

    const totalPrice = cart.items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0,
    );
    return { ...cart, totalPrice };
  } catch (error) {
    console.error("Error getting or creating cart:", error);
    throw new Error("Failed to get or create cart");
  }
}

// ─── GET /cart ── Get user's cart ───
const getCartRoute = createRoute({
  method: "get",
  path: "/",
  tags,
  summary: "Get user's cart",
  responses: {
    200: {
      description: "User's cart with items",
      content: { "application/json": { schema: CartSchema } },
    },
    400: {
      description: "Failed to get cart",
    },
  },
});

cartRoute.openapi(getCartRoute, async (c) => {
  const userId = (c.get("user" as never) as { id: string }).id;
  try {
    const cart = await getOrCreateCart(userId);
    const parsed = CartSchema.parse(cart);
    return c.json(parsed, 200);
  } catch {
    return c.json({ status: "failed", error: "Failed to get cart" }, 400);
  }
});

// ─── PUT /cart/items ── Add product to cart ───
const addToCartRoute = createRoute({
  method: "post",
  path: "/items",
  tags,
  summary: "Add product to cart",
  description:
    "If the product already exists in the cart, its quantity will be incremented.",
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
    400: { description: "Insufficient stock" },
    401: { description: "Unauthorized" },
    404: { description: "Product not found" },
    500: { description: "Failed to add product to cart" },
  },
});

cartRoute.openapi(addToCartRoute, async (c) => {
  const userId = (c.get("user" as never) as { id: string }).id;
  const { productId, quantity } = c.req.valid("json");

  try {
    const result = await prisma.$transaction(async (transaction) => {
      const [product, cart] = await Promise.all([
        transaction.product.findUnique({ where: { id: productId } }),
        transaction.cart.upsert({
          where: { userId },
          create: { userId },
          update: {},
        }),
      ]);

      if (!product) throw { status: 404, error: "Product not found" };
      if (product.stockQuantity < quantity) {
        throw {
          status: 400,
          error: `Insufficient stock. Available: ${product.stockQuantity}`,
        };
      }

      const existingItem = await transaction.cartItem.findUnique({
        where: { cartId_productId: { cartId: cart.id, productId } },
      });

      const newQuantity = (existingItem?.quantity ?? 0) + quantity;
      if (newQuantity > product.stockQuantity) {
        throw {
          status: 400,
          error: `Cannot add more. Current in cart: ${existingItem?.quantity}, Stock: ${product.stockQuantity}`,
        };
      }

      const [updatedItem] = await Promise.all([
        transaction.cartItem.upsert({
          where: { cartId_productId: { cartId: cart.id, productId } },
          create: { cartId: cart.id, productId, quantity },
          update: { quantity: newQuantity },
          include: { product: true },
        }),
        transaction.cart.update({
          where: { id: cart.id },
          data: { updatedAt: new Date() },
        }),
      ]);

      return { cart, updatedItem };
    });

    const updatedCart = await getOrCreateCart(userId);
    const parsed = CartSchema.parse(updatedCart);
    return c.json(parsed, 200);
  } catch (error: any) {
    if (error?.status) {
      return c.json({ error: error.error }, error.status);
    }
    return c.json({ error: "Failed to add product to cart" }, 500);
  }
});

// ─── DELETE /cart/items/:id ── Remove item from cart ───
const removeCartItemRoute = createRoute({
  method: "delete",
  path: "/items/{id}",
  tags,
  summary: "Remove item from cart",
  request: {
    params: CartItemParamSchema,
  },
  responses: {
    200: {
      description: "Item removed from cart",
      content: { "application/json": { schema: CartSchema } },
    },
    401: { description: "Unauthorized" },
    404: { description: "Cart item not found" },
    500: { description: "Failed to remove cart item" },
  },
});

cartRoute.openapi(removeCartItemRoute, async (c) => {
  const userId = (c.get("user" as never) as { id: string }).id;
  const { id } = c.req.valid("param");

  try {
    await prisma.$transaction(async (transaction) => {
      const cartItem = await transaction.cartItem.findFirst({
        where: { id, cart: { userId } },
      });

      if (!cartItem) throw { status: 404, error: "Cart item not found" };

      await Promise.all([
        transaction.cartItem.delete({ where: { id } }),
        transaction.cart.update({
          where: { id: cartItem.cartId },
          data: { updatedAt: new Date() },
        }),
      ]);
    });

    const updatedCart = await getOrCreateCart(userId);
    return c.json(CartSchema.parse(updatedCart), 200);
  } catch (error: any) {
    if (error?.status) return c.json({ error: error.error }, error.status);
    return c.json({ error: "Failed to remove cart item" }, 500);
  }
});

// ─── PATCH /cart/items/:id ── Update item quantity ───
const updateCartItemRoute = createRoute({
  method: "put",
  path: "/items/{id}",
  tags,
  summary: "Update cart item quantity",
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
    401: { description: "Unauthorized" },
    404: { description: "Cart item not found" },
    500: { description: "Failed to update cart item" },
  },
});

cartRoute.openapi(updateCartItemRoute, async (c) => {
  const userId = (c.get("user" as never) as { id: string }).id;
  const { id } = c.req.valid("param");
  const { quantity } = c.req.valid("json");

  try {
    await prisma.$transaction(async (transaction) => {
      const cartItem = await transaction.cartItem.findFirst({
        where: { id, cart: { userId } },
        include: { product: true },
      });

      if (!cartItem) throw { status: 404, error: "Cart item not found" };
      if (quantity > cartItem.product.stockQuantity) {
        throw {
          status: 400,
          error: `Insufficient stock. Available: ${cartItem.product.stockQuantity}`,
        };
      }

      await Promise.all([
        transaction.cartItem.update({ where: { id }, data: { quantity } }),
        transaction.cart.update({
          where: { id: cartItem.cartId },
          data: { updatedAt: new Date() },
        }),
      ]);
    });

    const updatedCart = await getOrCreateCart(userId);
    return c.json(CartSchema.parse(updatedCart), 200);
  } catch (err: any) {
    if (err?.status) return c.json({ error: err.error }, err.status);
    return c.json({ error: "Failed to update cart item" }, 500);
  }
});
