import { prisma } from "../src/lib/prisma";
import { createSlug } from "../src/modules/common/utils";
import { products } from "./data";

async function main() {
  console.log("🌱 Seeding database...");

  // Upsert products by SKU (stable identifier)
  for (const product of products) {
    const slug = createSlug(product.name);
    const result = await prisma.product.upsert({
      where: { sku: product.sku },
      update: {
        ...product,
        slug: slug,
      },
      create: {
        ...product,
        slug: slug,
      },
    });
    console.log(`☕ ${result.name} (${result.sku})`);
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
