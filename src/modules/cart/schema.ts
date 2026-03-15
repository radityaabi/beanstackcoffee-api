import { z } from "@hono/zod-openapi";
import { ProductSchema } from "../product/schema";
import {
  CartModelSchema,
  CartItemModelSchema,
} from "../../generated/zod/schemas";

export const CartItemSchema = CartItemModelSchema.strip()
  .extend({
    product: ProductSchema.strip().omit({
      createdAt: true,
      updatedAt: true,
    }),
  })
  .omit({
    cartId: true,
    createdAt: true,
    updatedAt: true,
  })
  .openapi("CartItem");

export const CartSchema = CartModelSchema.extend({
  items: z.array(CartItemSchema),
  totalPrice: z.number().int().openapi({ example: 100000 }),
}).openapi("Cart");

export const AddToCartSchema = z
  .object({
    productId: z.string().min(1).openapi({ example: "product-ulid-here" }),
    quantity: z.number().int().min(1).openapi({ example: 1 }),
  })
  .openapi("AddToCart");

export const UpdateCartItemSchema = z
  .object({
    quantity: z.number().int().min(1).openapi({ example: 2 }),
  })
  .openapi("UpdateCartItem");

export const CartItemParamSchema = z.object({
  id: z.string().min(1).openapi({ example: "cart-item-ulid" }),
});
