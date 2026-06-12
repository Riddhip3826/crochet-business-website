import fs from 'fs';
import path from 'path';
import { Product, Category, User, Order, Review, CustomOrder, PaymentSimulation } from '../src/types';

const STORE_PATH = path.join(process.cwd(), 'server-db-store.json');

// Aesthetic Seed Products
const SEED_PRODUCTS: Product[] = [
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
];


const SEED_CATEGORIES: Category[] = [
  { slug: "all", name: "All Products", icon: "Sparkles" },
  { slug: "keychains", name: "Keychains", icon: "KeyRound" },
  { slug: "flowers", name: "Flowers", icon: "Flower" },
  { slug: "hair-accessories", name: "Hair Accessories", icon: "Smile" },
  { slug: "bouquets", name: "Bouquets", icon: "Heart" },
  { slug: "mobile-covers", name: "Mobile Covers", icon: "Smartphone" }
];

const SEED_REVIEWS: Review[] = [
  {
    id: "rev-1",
    productId: "prod-bouquet-1",
    userId: "user-buyer-1",
    userName: "Ishita Shah",
    userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    rating: 5,
    comment: "This is THE hands-down prettiest thing I have ever bought 😭! The wool is so soft and thick, wrapped with absolute love. My sister literally screamed when she got this bouquet!",
    createdAt: "2026-05-18T10:00:00Z"
  },
  {
    id: "rev-2",
    productId: "prod-bouquet-1",
    userId: "user-buyer-2",
    userName: "Ananya Mehta",
    userAvatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&auto=format&fit=crop&q=80",
    rating: 5,
    comment: "Absolutely gorgeous packaging, it smelled lovely like lavender when matches arrived! Pinterest vibe is 100% matched.",
    createdAt: "2026-05-19T14:45:00Z"
  },
  {
    id: "rev-3",
    productId: "prod-keychain-1",
    userId: "user-buyer-3",
    userName: "Diya Patel",
    userAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80",
    rating: 5,
    comment: "So soft and adorable, sits stably on my pastel yellow backpack. Shipping to Vadodara was super fast too. Highly recommend crochet.softdiaries!",
    createdAt: "2026-05-15T08:20:00Z"
  }
];

interface DBState {
  users: User[];
  passwords: { [userId: string]: string }; // userId: bcryptHash
  otpTokens: { [contact: string]: { code: string, expiresAt: number } }; // email or phone: otp data
  products: Product[];
  categories: Category[];
  orders: Order[];
  reviews: Review[];
  wishlists: { [userId: string]: string[] }; // userId: [productIds]
  customOrders: CustomOrder[];
  payments: PaymentSimulation[];
}

class Database {
  private state: DBState = {
    users: [
      {
        id: "admin-id-1",
        email: "riddhip3826@gmail.com",
        name: "Admin Riddhi",
        role: "admin",
        phone: "1234567898",
        address: "Vadodara, Gujarat, India",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
      }
    ],
    passwords: {
      "admin-id-1": "admin", // Unused, we use bcrypt below
    },
    otpTokens: {},
    products: SEED_PRODUCTS,
    categories: SEED_CATEGORIES,
    orders: [],
    reviews: SEED_REVIEWS,
    wishlists: {},
    customOrders: [],
    payments: []
  };

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(STORE_PATH)) {
        const data = fs.readFileSync(STORE_PATH, 'utf-8');
        const parsed = JSON.parse(data);
        this.state = {
          users: parsed.users || this.state.users,
          passwords: parsed.passwords || this.state.passwords,
          otpTokens: parsed.otpTokens || this.state.otpTokens,
          products: parsed.products || this.state.products,
          categories: parsed.categories || this.state.categories,
          orders: parsed.orders || this.state.orders,
          reviews: parsed.reviews || this.state.reviews,
          wishlists: parsed.wishlists || this.state.wishlists,
          customOrders: parsed.customOrders || this.state.customOrders,
          payments: parsed.payments || this.state.payments
        };
      } else {
        this.save();
      }
    } catch (e) {
      console.error("Failed to load db-store:", e);
    }
  }

  private save() {
    try {
      fs.writeFileSync(STORE_PATH, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (e) {
      console.error("Failed to write to db-store:", e);
    }
  }

  // Auth Operations
  getUserPassword(userId: string): string | undefined {
    return this.state.passwords[userId];
  }

  setUserPassword(userId: string, hash: string) {
    this.state.passwords[userId] = hash;
    this.save();
  }

  setOTP(contact: string, code: string) {
    this.state.otpTokens[contact] = { code, expiresAt: Date.now() + 5 * 60 * 1000 }; // 5 min
    this.save();
  }

  verifyOTP(contact: string, code: string): boolean {
    const otpData = this.state.otpTokens[contact];
    if (otpData && otpData.code === code && otpData.expiresAt > Date.now()) {
      delete this.state.otpTokens[contact];
      this.save();
      return true;
    }
    return false;
  }

  // Users Handlers
  getUsers(): User[] {
    return this.state.users;
  }

  getUserById(id: string): User | undefined {
    return this.state.users.find(u => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(user: User): User {
    this.state.users.push(user);
    this.save();
    return user;
  }

  updateUser(id: string, data: Partial<User>): User | undefined {
    const userIndex = this.state.users.findIndex(u => u.id === id);
    if (userIndex !== -1) {
      this.state.users[userIndex] = { ...this.state.users[userIndex], ...data };
      this.save();
      return this.state.users[userIndex];
    }
    return undefined;
  }

  // Products Handlers
  getProducts(): Product[] {
    return this.state.products;
  }

  getProductById(id: string): Product | undefined {
    return this.state.products.find(p => p.id === id);
  }

  addProduct(product: Product): Product {
    this.state.products.push(product);
    this.save();
    return product;
  }

  updateProduct(id: string, productData: Partial<Product>): Product | undefined {
    const index = this.state.products.findIndex(p => p.id === id);
    if (index !== -1) {
      this.state.products[index] = { ...this.state.products[index], ...productData };
      this.save();
      return this.state.products[index];
    }
    return undefined;
  }

  deleteProduct(id: string): boolean {
    const lengthBefore = this.state.products.length;
    this.state.products = this.state.products.filter(p => p.id !== id);
    if (this.state.products.length < lengthBefore) {
      this.save();
      return true;
    }
    return false;
  }

  // Categories Handlers
  getCategories(): Category[] {
    return this.state.categories;
  }

  // Orders Handlers
  getOrders(): Order[] {
    return this.state.orders;
  }

  getOrdersByUser(userId: string): Order[] {
    return this.state.orders.filter(o => o.userId === userId);
  }

  createOrder(order: Order): Order {
    this.state.orders.unshift(order); // Newest orders first
    this.save();
    return order;
  }

  updateOrder(id: string, data: Partial<Order>): Order | undefined {
    const index = this.state.orders.findIndex(o => o.id === id);
    if (index !== -1) {
      this.state.orders[index] = { ...this.state.orders[index], ...data };
      this.save();
      return this.state.orders[index];
    }
    return undefined;
  }

  // Reviews Handlers
  getReviews(): Review[] {
    return this.state.reviews;
  }

  getReviewsByProduct(productId: string): Review[] {
    return this.state.reviews.filter(r => r.productId === productId);
  }

  addReview(review: Review): Review {
    this.state.reviews.push(review);
    
    // Recalculate average rating of product
    const product = this.getProductById(review.productId);
    if (product) {
      const productReviews = this.getReviewsByProduct(review.productId);
      const averageRating = parseFloat(
        (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1)
      );
      this.updateProduct(review.productId, {
        rating: averageRating,
        reviewsCount: productReviews.length
      });
    }
    
    this.save();
    return review;
  }

  deleteReview(id: string): boolean {
    const review = this.state.reviews.find(r => r.id === id);
    this.state.reviews = this.state.reviews.filter(r => r.id !== id);
    if (review) {
      const remainingReviews = this.getReviewsByProduct(review.productId);
      if (remainingReviews.length > 0) {
        const averageRating = parseFloat(
          (remainingReviews.reduce((sum, r) => sum + r.rating, 0) / remainingReviews.length).toFixed(1)
        );
        this.updateProduct(review.productId, {
          rating: averageRating,
          reviewsCount: remainingReviews.length
        });
      } else {
        this.updateProduct(review.productId, {
          rating: 5.0,
          reviewsCount: 0
        });
      }
      this.save();
      return true;
    }
    return false;
  }

  // Custom Orders Handlers
  getCustomOrders(): CustomOrder[] {
    return this.state.customOrders;
  }

  getCustomOrdersByUser(userId: string): CustomOrder[] {
    return this.state.customOrders.filter(co => co.userId === userId);
  }

  addCustomOrder(order: CustomOrder): CustomOrder {
    this.state.customOrders.unshift(order);
    this.save();
    return order;
  }

  updateCustomOrderStatus(id: string, data: Partial<CustomOrder>): CustomOrder | undefined {
    const index = this.state.customOrders.findIndex(co => co.id === id);
    if (index !== -1) {
      this.state.customOrders[index] = { ...this.state.customOrders[index], ...data };
      this.save();
      return this.state.customOrders[index];
    }
    return undefined;
  }

  // Wishlist Handlers
  getWishlist(userId: string): string[] {
    return this.state.wishlists[userId] || [];
  }

  addToWishlist(userId: string, productId: string): string[] {
    if (!this.state.wishlists[userId]) {
      this.state.wishlists[userId] = [];
    }
    if (!this.state.wishlists[userId].includes(productId)) {
      this.state.wishlists[userId].push(productId);
      this.save();
    }
    return this.state.wishlists[userId];
  }

  removeFromWishlist(userId: string, productId: string): string[] {
    if (this.state.wishlists[userId]) {
      this.state.wishlists[userId] = this.state.wishlists[userId].filter(id => id !== productId);
      this.save();
    }
    return this.state.wishlists[userId] || [];
  }

  // Payments
  getPayments(): PaymentSimulation[] {
    return this.state.payments;
  }

  addPayment(payment: PaymentSimulation) {
    this.state.payments.unshift(payment);
    this.save();
  }
}

export const db = new Database();
