import "dotenv/config";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { serveStatic } from "hono/bun";
import { Scalar } from "@scalar/hono-api-reference";
import { OpenAPIHono } from "@hono/zod-openapi";
import { productRoute } from "./modules/product/route";
import { authRoute } from "./modules/auth/route";
import { userRoute } from "./modules/user/route";
import { cartRoute } from "./modules/cart/route";

const app = new OpenAPIHono();

// ─── Middleware ───
app.use(logger());
app.use(
  "/*",
  cors({
    origin: ["http://localhost:5173", "https://beanstackcoffee.radityaabi.com"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

// ─── Static Files ───
app.use("/images/*", serveStatic({ root: "./public" }));

// ─── Routes ───
app.route("/products", productRoute);
app.route("/auth", authRoute);
app.route("/users", userRoute);
app.route("/cart", cartRoute);

// ─── Welcome ───
app.get("/api", (c) => {
  return c.json({
    title: "Beanstack Coffee API",
    message:
      "Welcome to the Beanstack Coffee API! Explore our endpoints to discover a variety of coffee products.",
    docs: "/",
    endpoints: {
      products: "/products",
      auth: "/auth",
      users: "/users",
      cart: "/cart",
    },
  });
});

// ─── OpenAPI Documentation ───
app.doc("/openapi.json", {
  openapi: "3.0.3",
  info: {
    version: "1.0.0",
    title: "Beanstack Coffee API",
    description:
      "REST API for the Beanstack Coffee ecommerce application. Features product catalog with pagination, filtering, and searching, user authentication with JWT, and shopping cart management.",
  },
});

app.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
  description: "Enter your JWT token",
});

app.get("/", Scalar({ url: "/openapi.json" }));

export default app;
