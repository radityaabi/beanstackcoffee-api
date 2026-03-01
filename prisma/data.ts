import { SeedProducts } from "../src/modules/product/schema";

export const products: SeedProducts = [
  {
    name: "Mens Rea Blend 340g",
    sku: "CF-BEANS-001",
    type: "BLEND" as const,
    price: 149000,
    weight: 340,
    stockQuantity: 50,
    imageUrl:
      "https://2xm7hdufl9.ucarecd.net/3afeafd7-7776-40cd-a64f-6f3f23e8e9a1/mensreablend.png",
    description:
      "Blend yang bold dan kompleks, memadukan kedalaman earthy Robusta Sumatra dengan keasaman cerah Arabika Toraja. Roast medium-dark dengan cita rasa dark chocolate, kayu cedar, dan sentuhan buah tropis. Cocok untuk pecinta espresso.",
  },
  {
    name: "Toraja Kalosi Arabica 250g",
    sku: "CF-BEANS-002",
    type: "ARABICA" as const,
    price: 195000,
    weight: 250,
    stockQuantity: 35,
    imageUrl:
      "https://2xm7hdufl9.ucarecd.net/d6c1d6a7-5ab0-4422-b2d3-2750f854a727/torajakalosiarabica.png",
    description:
      "Arabika single-origin dari dataran tinggi Tana Toraja, Sulawesi Selatan. Diproses wet-hulled dan dijemur di ketinggian 1.500 mdpl. Profil rasa kompleks dengan nuansa beri gelap, rempah, dan manis smoky yang tahan lama.",
  },
  {
    name: "Gayo Mountain Reserve 340g",
    sku: "CF-BEANS-003",
    type: "ARABICA" as const,
    price: 220000,
    weight: 340,
    stockQuantity: 25,
    imageUrl:
      "https://2xm7hdufl9.ucarecd.net/3cd44a25-d8fc-4d52-a977-fc566af061c2/gayomountainreserve.png",
    description:
      "Arabika premium dari dataran tinggi vulkanik Gayo, Aceh. Ditanam di ketinggian 1.400–1.600 mdpl oleh koperasi lokal. Roast medium dengan keasaman citrus yang cerah, manis madu, dan akhir rasa bersih seperti teh.",
  },
  {
    name: "Java Preanger Estate 250g",
    sku: "CF-BEANS-004",
    type: "ARABICA" as const,
    price: 185000,
    weight: 250,
    stockQuantity: 40,
    imageUrl:
      "https://2xm7hdufl9.ucarecd.net/d10427cc-0e1d-41a1-9353-393ddcfe73bb/javapreangerestate.png",
    description:
      "Arabika estate dari dataran tinggi Preanger, Jawa Barat. Kopi klasik Jawa dengan roast medium-dark, body tebal, keasaman rendah, serta cita rasa herbal, malt, dan cokelat pahit manis.",
  },
  {
    name: "Lampung Robusta Premium 500g",
    sku: "CF-BEANS-005",
    type: "ROBUSTA" as const,
    price: 89000,
    weight: 500,
    stockQuantity: 80,
    imageUrl:
      "https://2xm7hdufl9.ucarecd.net/b23f0b08-0e7a-42f7-9634-555e67efd627/lampungrobustapremium.png",
    description:
      "Robusta grade premium dari Lampung, Sumatra Selatan. Dark roast untuk body maksimal dengan rasa earthy yang intens. Nuansa walnut, karamel gelap, dan akhir rasa kuat serta penuh. Ideal untuk kopi gaya Vietnam.",
  },
  {
    name: "Bali Kintamani Natural 250g",
    sku: "CF-BEANS-006",
    type: "ARABICA" as const,
    price: 245000,
    weight: 250,
    stockQuantity: 15,
    imageUrl:
      "https://2xm7hdufl9.ucarecd.net/2286c219-a99e-4563-80af-007b13a46bd7/balikintamaninatural.png",
    description:
      "Arabika proses natural dari lereng Gunung Batur, Kintamani. Roast light menonjolkan rasa buah blueberry yang cerah, cokelat susu, dan madu. Ditanam bersama pohon jeruk menggunakan sistem irigasi tradisional subak.",
  },
  {
    name: "Flores Bajawa Honey 250g",
    sku: "CF-BEANS-007",
    type: "ARABICA" as const,
    price: 210000,
    weight: 250,
    stockQuantity: 20,
    imageUrl:
      "https://2xm7hdufl9.ucarecd.net/3de93bae-f823-45c1-864d-f7a91b46f9be/floresbajawahoney.png",
    description:
      "Arabika proses honey dari dataran tinggi Bajawa, Flores, NTT. Roast light-medium dengan body manis seperti sirup. Terdapat rasa mangga tropis, gula aren, dan aroma floral yang lembut.",
  },
  {
    name: "Sumatra Mandheling Gold 340g",
    sku: "CF-BEANS-008",
    type: "ARABICA" as const,
    price: 175000,
    weight: 340,
    stockQuantity: 45,
    imageUrl:
      "https://2xm7hdufl9.ucarecd.net/012333f4-c159-44d7-bd16-0c02e967c687/sumatramandhelinggold.png",
    description:
      "Mandheling grade premium dari Sumatra Utara. Dipilih tiga kali dan diproses wet-hulled untuk kualitas terbaik. Dark roast dengan body penuh dan velvety, keasaman rendah, serta rasa kompleks tembakau pipa, earthy, dan dark chocolate.",
  },
  {
    name: "Temanggung Fine Robusta 250g",
    sku: "CF-BEANS-009",
    type: "ROBUSTA" as const,
    price: 95000,
    weight: 250,
    stockQuantity: 60,
    imageUrl:
      "https://2xm7hdufl9.ucarecd.net/57a417a1-01c4-4a3f-9f4b-c4ebfaa3f9fd/temanggungfinerobusta.png",
    description:
      "Fine Robusta dari lereng Gunung Sumbing, Temanggung, Jawa Tengah. Robusta specialty dengan kompleksitas mengejutkan. Roast medium-dark dengan rasa gula merah, kacang mete, dan akhir nutty yang halus.",
  },
  {
    name: "Papua Wamena Highland 340g",
    sku: "CF-BEANS-010",
    type: "ARABICA" as const,
    price: 285000,
    weight: 340,
    stockQuantity: 10,
    imageUrl:
      "https://2xm7hdufl9.ucarecd.net/95d51b0c-2b17-4d1d-bd44-843160d27436/papuawamenahighland.png",
    description:
      "Arabika langka dari Lembah Baliem, Papua. Ditanam oleh petani lokal di ketinggian 1.500–2.000 mdpl tanpa bahan kimia. Roast medium dengan karakter unik: floral, fruity dengan sentuhan stone fruit, dan akhir rasa manis yang bersih.",
  },
  {
    name: "Nusantara Morning Blend 250g",
    sku: "CF-BEANS-011",
    type: "BLEND" as const,
    price: 125000,
    weight: 250,
    stockQuantity: 70,
    imageUrl:
      "https://2xm7hdufl9.ucarecd.net/44ef977a-d1a6-4678-a7fd-0ac50c65c759/nusantaramorningblend.png",
    description:
      "Blend harian yang diracik dari Arabika Jawa dan Robusta Lampung. Roast medium menghasilkan cangkir yang seimbang dan mudah dinikmati, dengan nuansa cokelat susu, almond panggang, dan manis lembut di akhir.",
  },
  {
    name: "Aceh Gayo Organic 340g",
    sku: "CF-BEANS-012",
    type: "ARABICA" as const,
    price: 235000,
    weight: 340,
    stockQuantity: 18,
    imageUrl:
      "https://2xm7hdufl9.ucarecd.net/26f0f239-2bf2-443e-962c-fb644d35e5ad/acehgayoorganic.png",
    description:
      "Arabika organik bersertifikat dari wilayah Gayo, Aceh. Dipasok melalui koperasi petani kecil dengan prinsip fair-trade. Body kaya dan penuh, dengan lapisan rasa buah gelap, cengkeh, dan molase yang kompleks.",
  },
  {
    name: "Sulawesi Enrekang Washed 250g",
    sku: "CF-BEANS-013",
    type: "ARABICA" as const,
    price: 178000,
    weight: 250,
    stockQuantity: 30,
    imageUrl:
      "https://2xm7hdufl9.ucarecd.net/2e63fb83-5ee5-4b21-ba5f-266599c1913c/sulawesienrekangwashed.png",
    description:
      "Arabika fully washed dari dataran tinggi Enrekang, Sulawesi Selatan. Roast medium dengan profil bersih dan cerah, menghadirkan rasa apel hijau, lemon zest, dan gula merah dengan tekstur silky di mulut.",
  },
  {
    name: "West Java Ciwidey Peaberry 250g",
    sku: "CF-BEANS-014",
    type: "ARABICA" as const,
    price: 265000,
    weight: 250,
    stockQuantity: 8,
    imageUrl:
      "https://2xm7hdufl9.ucarecd.net/7f059b22-ab9f-4c0e-8310-3894e56d08ab/westjavaciwideypeaberry.png",
    description:
      "Biji peaberry pilihan tangan dari Ciwidey, Bandung. Ukurannya lebih kecil dan padat sehingga menghasilkan roasting lebih merata. Memberikan rasa berry yang cerah, melati, dan sentuhan kakao manis yang intens.",
  },
  {
    name: "Bengkulu Rejang Lebong 250g",
    sku: "CF-BEANS-015",
    type: "ARABICA" as const,
    price: 155000,
    weight: 250,
    stockQuantity: 38,
    imageUrl:
      "https://2xm7hdufl9.ucarecd.net/31e5eccd-2531-4e8b-b0f9-c8710b828298/bengkulurejanglebong.png",
    description:
      "Arabika dari wilayah Rejang Lebong, Bengkulu, Sumatra. Roast medium dengan profil halus dan seimbang, menghadirkan rasa toffee, plum matang, dan sentuhan herbal lembut di akhir.",
  },
  {
    name: "Kopi Joss Traditional Robusta 250g",
    sku: "CF-BEANS-016",
    type: "ROBUSTA" as const,
    price: 75000,
    weight: 250,
    stockQuantity: 100,
    imageUrl:
      "https://2xm7hdufl9.ucarecd.net/099de115-16f8-402f-86a6-1872759ab95f/kopijosstraditional.png",
    description:
      "Robusta tradisional khas Jawa dengan dark roast klasik. Rasa kuat, smoky, dan woody dengan body tebal seperti sirup. Terinspirasi dari tradisi Kopi Joss khas Yogyakarta.",
  },
  {
    name: "Sunda Hejo Green Bean Arabica 1kg",
    sku: "CF-BEANS-017",
    type: "ARABICA" as const,
    price: 140000,
    weight: 1000,
    stockQuantity: 55,
    imageUrl:
      "https://2xm7hdufl9.ucarecd.net/01b27281-226f-4019-920f-8fe65ef32590/sundahejogreenbean.png",
    description:
      "Biji kopi hijau (belum disangrai) dari wilayah Sunda, Jawa Barat. Cocok untuk home roaster yang ingin mengontrol profil roasting sendiri. Arabika berkualitas tinggi dengan potensi optimal untuk roast light hingga medium.",
  },
  {
    name: "Espresso Nusantara Blend 340g",
    sku: "CF-BEANS-018",
    type: "BLEND" as const,
    price: 165000,
    weight: 340,
    stockQuantity: 42,
    imageUrl:
      "https://2xm7hdufl9.ucarecd.net/4ea32a41-32c9-420f-8aaa-deb26521774d/espressonusantarablend.png",
    description:
      "Blend espresso khusus yang memadukan Arabika Gayo, Robusta Temanggung, dan Arabika Flores. Dark roast dirancang untuk crema tebal, body kaya, dan profil rasa seimbang dengan nuansa dark chocolate, hazelnut, dan karamel.",
  },
  {
    name: "Liberika Meranti Rare Edition 340g",
    sku: "CF-BEANS-019",
    type: "BLEND" as const,
    price: 310000,
    weight: 340,
    stockQuantity: 5,
    imageUrl:
      "https://2xm7hdufl9.ucarecd.net/a7482ec7-8c00-4000-87d5-767d642621c5/liberikamerantirare.png",
    description:
      "Biji Liberika langka dari Kepulauan Meranti, Riau. Dikenal dengan ukuran besar dan bentuk asimetris unik. Profil rasa fruity, smoky, dan floral dengan sentuhan nangka, beri gelap, serta gula terbakar. Kopi kolektor yang istimewa.",
  },
  {
    name: "Cold Brew Starter Pack 250g",
    sku: "CF-BEANS-020",
    type: "BLEND" as const,
    price: 115000,
    weight: 250,
    stockQuantity: 65,
    imageUrl:
      "https://2xm7hdufl9.ucarecd.net/0e7aa3b9-c6ae-49b7-969c-b26a5dc2310b/coldbrewstarterpack.png",
    description:
      "Blend gilingan kasar yang dioptimalkan untuk ekstraksi cold brew. Perpaduan biji Brasil dan Sumatra dengan roast medium-dark menghasilkan cold brew yang halus, rendah asam, dengan nuansa kakao, vanila, dan gula merah. Cukup tambahkan air dan diamkan 12–24 jam.",
  },
];
