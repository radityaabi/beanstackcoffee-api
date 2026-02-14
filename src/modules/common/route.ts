import { Hono } from "hono";

export const commonRoute = new Hono();

commonRoute.get("/", (c) => {
  return c.json({
    title: "Beanstack Coffee API",
    message: "Welcome to the Beanstack Coffee API! Explore our endpoints to discover a variety of coffee products, including details such as categories, brands, prices, and flavor profiles. Use the /products endpoint to browse all products or /products/:slug to get information about a specific product.",
    description:
      "This API provides access to a curated selection of coffee products, allowing you to find the perfect brew for your taste. Whether you're a coffee connoisseur or just looking for your next favorite cup, our API has something for everyone. Happy brewing!",
  });
});