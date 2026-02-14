import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { Scalar } from "@scalar/hono-api-reference";
import { OpenAPIHono } from "@hono/zod-openapi";
import { productRoutes } from "./modules/products/route";

const app = new OpenAPIHono();

app.use(logger());
app.route("/products", productRoutes);
app.use("/products",cors());

// OpenAPI Documentation Route
app.doc("/openapi.json", {
  openapi: "3.0.3",
  info: {
    version: "1.0.0",
    title: "Beanstack Coffee API",
    description: "API documentation for the Beanstack Coffee Application",
  },
});

app.get("/", Scalar({ url: "/openapi.json" }));

export default app;