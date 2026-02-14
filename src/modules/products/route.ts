import { OpenAPIHono } from "@hono/zod-openapi";

export const productRoutes = new OpenAPIHono();

const tags = ["products"];

productRoutes.openapi(
  {
    path: "/",
    method: "get",
    tags,
    description: "Get All Product",
    responses: {
      200: {
        description: "Successfully get tes product",
      },
    },
  },
  (c) => {
    const product = "tes products";
    return c.json(product, 200);
  },
);