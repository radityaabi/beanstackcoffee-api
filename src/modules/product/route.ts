import { OpenAPIHono } from "@hono/zod-openapi";

export const productRoute = new OpenAPIHono();

const tags = ["products"];

productRoute.openapi(
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
    const products = [{}];
    return c.json(products, 200);
  },
);
