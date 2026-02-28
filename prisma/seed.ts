import { prisma } from "../src/lib/prisma";
import { products } from "./data";

async function main() {
  console.log("🌱 Seeding database...");

  // Upsert products
  for (const product of products) {
    const result = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        sku: product.sku,
        type: product.type,
        price: product.price,
        stockQuantity: product.stockQuantity,
        imageUrl: product.imageUrl,
        description: product.description,
      },
      create: {
        slug: product.slug,
        name: product.name,
        sku: product.sku,
        type: product.type,
        price: product.price,
        stockQuantity: product.stockQuantity,
        imageUrl: product.imageUrl,
        description: product.description,
      },
    });
    console.log(`  ✅ ${result.name} (${result.sku})`);
  }

  console.log(`\n🎉 Seeded ${products.length} products successfully!`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
