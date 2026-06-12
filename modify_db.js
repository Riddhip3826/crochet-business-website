const fs = require('fs');
const fileBuffer = fs.readFileSync('server/db.ts', 'utf8');

const newProducts = `const SEED_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Evil Eye Hanging Keychain",
    description: "Keep bad vibes away with this beautifully handcrafted evil eye hanging keychain. Perfect for your bags or car keys.",
    price: 200,
    originalPrice: 200,
    category: "keychains",
    images: ["https://images.unsplash.com/photo-1618683506939-50284ab99b82?w=500&auto=format&fit=crop&q=80"],
    rating: 5.0, reviewsCount: 0, stock: 10, size: "Standard", colors: ["Blue"],
    isBestSeller: true, isFeatured: true,
    details: ["Handcrafted evil eye pattern", "Durable metal ring", "Perfect charm"]
  },
  {
    id: "prod-2",
    name: "Flower Keychain",
    description: "A cute little crochet flower to bring a smile to your face. Bright and colorful addition to your keys.",
    price: 50,
    originalPrice: 50,
    category: "keychains",
    images: ["https://images.unsplash.com/photo-1577085718919-4592d3f7f0ed?w=500&auto=format&fit=crop&q=80"],
    rating: 4.8, reviewsCount: 0, stock: 20, size: "Standard", colors: ["Assorted"],
    isBestSeller: false, isFeatured: false,
    details: ["Soft yarn", "Vibrant colors", "Lightweight"]
  },
  {
    id: "prod-3",
    name: "Heart Keychain",
    description: "Show some love with this adorable plush heart keychain. A sweet gift for yourself or someone special.",
    price: 150,
    originalPrice: 150,
    category: "keychains",
    images: ["https://images.unsplash.com/photo-1518199266791-5375a83164ba?w=500&auto=format&fit=crop&q=80"],
    rating: 4.9, reviewsCount: 0, stock: 15, size: "Standard", colors: ["Red"],
    isBestSeller: true, isFeatured: false,
    details: ["Symmetrical heart shape", "Plush feel", "Sturdy keyring"]
  },
  {
    id: "prod-4",
    name: "Bow Keychain",
    description: "A delicate and cute crocheted bow keychain to accessorize your everyday items.",
    price: 100,
    originalPrice: 100,
    category: "keychains",
    images: ["https://images.unsplash.com/photo-1601391783478-f71afdafb02b?w=500&auto=format&fit=crop&q=80"],
    rating: 4.7, reviewsCount: 0, stock: 12, size: "Standard", colors: ["Pink"],
    isBestSeller: false, isFeatured: false,
    details: ["Elegant bow design", "Soft texture"]
  },
  {
    id: "prod-5",
    name: "Sunflower Keychain",
    description: "Carry a pocketful of sunshine wherever you go with our detailed sunflower keychain.",
    price: 180,
    originalPrice: 180,
    category: "keychains",
    images: ["https://images.unsplash.com/photo-1596489311494-df7ce266becc?w=500&auto=format&fit=crop&q=80"],
    rating: 5.0, reviewsCount: 0, stock: 10, size: "Standard", colors: ["Yellow"],
    isBestSeller: true, isFeatured: true,
    details: ["Realistic sunflower center", "Bright yellow petals"]
  },
  {
    id: "prod-6",
    name: "Evil Eye Keychain",
    description: "A compact, round evil eye keychain pattern. Traditional protection charm stylized in cozy yarn.",
    price: 180,
    originalPrice: 180,
    category: "keychains",
    images: ["https://images.unsplash.com/photo-1641721528657-695015bbf725?w=500&auto=format&fit=crop&q=80"],
    rating: 4.9, reviewsCount: 0, stock: 10, size: "Standard", colors: ["Blue", "White"],
    isBestSeller: false, isFeatured: false,
    details: ["Compact design", "Classic evil eye colors"]
  },
  {
    id: "prod-7",
    name: "Gray with Bow Mobile Cover",
    description: "A snug crocheted mobile phone cover in elegant gray, finished with a cute contrasting bow.",
    price: 400,
    originalPrice: 400,
    category: "mobile-covers",
    images: ["https://images.unsplash.com/photo-1541880907530-58097b6a4b12?w=500&auto=format&fit=crop&q=80"],
    rating: 4.8, reviewsCount: 0, stock: 5, size: "Universal Phone Size", colors: ["Gray"],
    isBestSeller: true, isFeatured: false,
    details: ["Protects from scratches", "Soft buffer layer", "Adorable bow detail"]
  },
  {
    id: "prod-8",
    name: "Purple with Bow Mobile Cover",
    description: "Make a statement with this vibrant purple crocheted mobile cover featuring an adorable bow accent.",
    price: 400,
    originalPrice: 400,
    category: "mobile-covers",
    images: ["https://images.unsplash.com/photo-1522069169874-c58ced4b69c5?w=500&auto=format&fit=crop&q=80"],
    rating: 4.9, reviewsCount: 0, stock: 5, size: "Universal Phone Size", colors: ["Purple"],
    isBestSeller: false, isFeatured: true,
    details: ["Striking purple hue", "Handcrafted warmth", "Secure fit"]
  },
  {
    id: "prod-9",
    name: "Mobile Cover with Charm",
    description: "A beautifully textured mobile cover that comes with a delightful crochet charm hanging from the side.",
    price: 450,
    originalPrice: 450,
    category: "mobile-covers",
    images: ["https://images.unsplash.com/photo-1550977870-ab886cfa3213?w=500&auto=format&fit=crop&q=80"],
    rating: 5.0, reviewsCount: 0, stock: 4, size: "Universal Phone Size", colors: ["Assorted"],
    isBestSeller: true, isFeatured: true,
    details: ["Includes dangling charm", "Premium yarn used", "Elegant pattern"]
  },
  {
    id: "prod-10",
    name: "Sunflower Hairtie",
    description: "Wrap your hair in sunshine! A sturdy hairtie featuring a hand-crocheted sunflower.",
    price: 150,
    originalPrice: 150,
    category: "hair-accessories",
    images: ["https://images.unsplash.com/photo-1505374825946-b51cb59ac911?w=500&auto=format&fit=crop&q=80"],
    rating: 4.7, reviewsCount: 0, stock: 15, size: "One Size", colors: ["Yellow"],
    isBestSeller: false, isFeatured: false,
    details: ["Gentle on hair", "Sturdy elastic band", "Detailed petals"]
  },
  {
    id: "prod-11",
    name: "Crochet Hairband",
    description: "A comfortable, beautifully patterned crochet hairband designed to add a soft touch to any hairstyle.",
    price: 300,
    originalPrice: 300,
    category: "hair-accessories",
    images: ["https://images.unsplash.com/photo-1534065404118-2adac6e2cacc?w=500&auto=format&fit=crop&q=80"],
    rating: 4.9, reviewsCount: 0, stock: 8, size: "One Size", colors: ["Assorted"],
    isBestSeller: true, isFeatured: false,
    details: ["Breathable yarn", "Comfortable fit"]
  },
  {
    id: "prod-12",
    name: "3 Flower Bouquet",
    description: "A lovely mini crochet bouquet containing three intricate flowers. A lasting alternative to real flowers.",
    price: 350,
    originalPrice: 350,
    category: "bouquets",
    images: ["https://images.unsplash.com/photo-1563241527-3004b7be0426?w=500&auto=format&fit=crop&q=80"],
    rating: 5.0, reviewsCount: 0, stock: 5, size: "Medium", colors: ["Multicolor"],
    isBestSeller: true, isFeatured: true,
    details: ["Three unique blooms", "Bendable stems", "Everlasting beauty"]
  },
  {
    id: "prod-13",
    name: "Rose Flower",
    description: "A solitary handmade crochet rose. A timeless romantic gesture that will never wither.",
    price: 120,
    originalPrice: 120,
    category: "flowers",
    images: ["https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=500&auto=format&fit=crop&q=80"],
    rating: 4.8, reviewsCount: 0, stock: 20, size: "20cm", colors: ["Red"],
    isBestSeller: false, isFeatured: false,
    details: ["Lifelike petal layers", "Wire stem inside"]
  },
  {
    id: "prod-14",
    name: "Crochet Sunflower",
    description: "A bright, vibrant crochet sunflower stalk. Brings warmth and light to any room's decor.",
    price: 200,
    originalPrice: 200,
    category: "flowers",
    images: ["https://images.unsplash.com/photo-1596489311494-df7ce266becc?w=500&auto=format&fit=crop&q=80"],
    rating: 5.0, reviewsCount: 0, stock: 12, size: "25cm", colors: ["Yellow"],
    isBestSeller: true, isFeatured: true,
    details: ["Thick stem", "Textured seed center"]
  },
  {
    id: "prod-15",
    name: "Big Red Rose",
    description: "A highly detailed, oversized red rose. Makes an impactful and unforgettable handmade gift.",
    price: 200,
    originalPrice: 200,
    category: "flowers",
    images: ["https://images.unsplash.com/photo-1559564484-e48b3e040ff4?w=500&auto=format&fit=crop&q=80"],
    rating: 4.9, reviewsCount: 0, stock: 10, size: "25cm", colors: ["Deep Red"],
    isBestSeller: false, isFeatured: false,
    details: ["Large blooming head", "Rich crimson red yarn"]
  }
];`;

const newCategories = `const SEED_CATEGORIES: Category[] = [
  { slug: "all", name: "All Products", icon: "Sparkles" },
  { slug: "keychains", name: "Keychains", icon: "KeyRound" },
  { slug: "flowers", name: "Flowers", icon: "Flower" },
  { slug: "hair-accessories", name: "Hair Accessories", icon: "Smile" },
  { slug: "bouquets", name: "Bouquets", icon: "Heart" },
  { slug: "mobile-covers", name: "Mobile Covers", icon: "Smartphone" }
];`;

let out = fileBuffer.replace(/const SEED_PRODUCTS: Product\[\] = \[[\s\S]*?\];\n\nconst SEED_CATEGORIES/m, newProducts + "\n\n" + newCategories + "\n\n// old categories was here\nconst TEMP_CATEGORIES");
out = out.replace(/const SEED_CATEGORIES: Category\[\] = \[[\s\S]*?\];/m, "");
out = out.replace(/\n\/\/ old categories was here\nconst TEMP_CATEGORIES/m, "");

fs.writeFileSync('server/db.ts', out);
console.log("DB Updated");
