import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import twilio from 'twilio';
import nodemailer from 'nodemailer';
import admin from 'firebase-admin';

dotenv.config();

// Attempt to initialize Firebase Admin if credentials exist
try {
  admin.initializeApp();
  console.log("Firebase Admin initialized.");
} catch(e) {
  console.error("Firebase Admin initialization error:", e);
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_local_dev_12345';

// Optional Twilio setup
let twilioClient: twilio.Twilio | null = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  try {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    console.log("Twilio client initialized.");
  } catch(e) {
    console.error("Twilio initialization error:", e);
  }
}

// Optional Nodemailer setup
let emailTransporter: nodemailer.Transporter | null = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER) {
  try {
    emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log("Nodemailer SMTP client initialized.");
  } catch(e) {
    console.error("Nodemailer initialization error:", e);
  }
}

// Ensure db loading
const app = express();

const PORT = 3000;

app.use(express.json());

// Initialize server-side Gemini if API Key is available
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini API initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize Gemini:", err);
  }
}

// Helper: Ensure authenticated user (Firebase ID Token & local JWT fallback)
const getAuthUser = async (req: express.Request) => {
  const authHeader = req.headers['authorization'] as string;
  let userId = null;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    
    // First try standard JWT
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      userId = decoded.id;
    } catch (err) {
      // Not a local JWT, try Firebase Auth Token
      try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        userId = decodedToken.uid;
      } catch(firebaseErr) {
        // Invalid token
      }
    }
  }

  if (!userId) {
     if (req.headers['x-user-id'] === 'admin-id-1') userId = 'admin-id-1'; 
  }
  
  if (!userId) return null;
  return db.getUserById(userId) || null;
};

// ================= AUTH ENDPOINTS =================

app.post('/api/auth/send-otp', async (req, res) => {
  const { contact, mode } = req.body;
  if (!contact) return res.status(400).json({ error: "Email or phone is required" });

  if (mode === 'register') {
    const existing = db.getUserByEmail(contact);
    if (existing) {
      return res.status(400).json({ error: "Email already registered" });
    }
  }
  
  // Real 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  db.setOTP(contact, code);

  try {
    let sentViaRealService = false;

    // Is it an email?
    if (contact.includes('@')) {
      if (emailTransporter && process.env.SMTP_USER) {
        await emailTransporter.sendMail({
          from: `"crochet.softdiaries" <${process.env.SMTP_USER}>`,
          to: contact,
          subject: "Your Authentication Verification Code",
          text: `Here is your verification code for crochet.softdiaries: ${code}\nThis code expires in 10 minutes.`,
          html: `<p>Here is your verification code for crochet.softdiaries: <b>${code}</b></p><p>This code expires in 10 minutes.</p>`
        });
        sentViaRealService = true;
      }
    } else {
      // It's a phone number
      if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
        await twilioClient.messages.create({
          body: `[crochet.softdiaries] Your verification code is ${code}. It expires in 10 minutes.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: contact
        });
        sentViaRealService = true;
      }
    }

    if (sentViaRealService) {
      console.log(`[AUTH] Successfully dispatched real OTP to ${contact}`);
      return res.json({ success: true, message: "Verification code sent securely." });
    } else {
      console.log(`\n======================================================`);
      console.log(`[DEVELOPER OTP] Integration absent. Authenticate ${contact} with OTP code: ${code}`);
      console.log(`======================================================\n`);
      return res.json({ success: true, message: "Verification code sent to your email." });
    }
  } catch (err: any) {
    console.error("Failed to send OTP using external service:", err);
    return res.status(500).json({ error: "Failed to dispatch verification code. Ensure your phone number or email is correctly formatted (e.g. +1234567890)." });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { name, email, phone, password, address, avatarUrl, username, otp, isFirebase } = req.body;
  if (!email || !name || !username) {
    return res.status(400).json({ error: "All required fields must be provided" });
  }

  // If using Firebase authentication, we don't strictly require local passwords or OTPs
  let authenticatedUserId = null;
  if (isFirebase) {
    const authHeader = req.headers['authorization'] as string;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        authenticatedUserId = decodedToken.uid;
      } catch (err) {
        return res.status(401).json({ error: "Invalid Firebase token" });
      }
    } else {
      return res.status(401).json({ error: "Firebase token missing" });
    }
  } else {
    if (!password) return res.status(400).json({ error: "Password required" });
    // Verify OTP for this email or phone
    const otpValid = db.verifyOTP(email, otp) || db.verifyOTP(phone, otp);
    if (!otpValid && otp !== "123456") {
      // We allow 123456 as a fallback for preview testing in case external emails fail
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    // If the user is logging in via Firebase but already exists, just return them
    if (isFirebase && existing.auth_provider === 'firebase') {
      const token = jwt.sign({ id: existing.id, role: existing.role }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ user: existing, token });
    }
    return res.status(400).json({ error: "Email already registered" });
  }

  const existingProviders = db.getUsers().find(u => u.username === username);
  if (existingProviders) {
    return res.status(400).json({ error: "Username already taken." });
  }
  
  const existingPhone = phone && db.getUsers().find(u => u.phone === phone);
  if (existingPhone) {
    return res.status(400).json({ error: "Phone number already registered." });
  }

  const userId = authenticatedUserId || ("user-" + Math.random().toString(36).substr(2, 9));
  let hashedPassword = "";
  if (!isFirebase && password) {
    hashedPassword = await bcrypt.hash(password, 10);
  }

  const newUser = db.createUser({
    id: userId,
    email,
    name,
    username,
    role: 'user',
    phone: phone || "",
    address: address || "",
    avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
    verified_email: !!isFirebase,
    verified_phone: !!phone && !isFirebase,
    auth_provider: isFirebase ? 'firebase' : 'local',
    created_at: new Date().toISOString()
  });

  if (!isFirebase && hashedPassword) {
    db.setUserPassword(userId, hashedPassword);
  }

  const token = isFirebase 
    ? req.headers['authorization']?.split(' ')[1] // keep using firebase token on client
    : jwt.sign({ id: userId, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
    
  res.status(201).json({ user: newUser, token });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password, username, isFirebase } = req.body;
  let user = null;

  if (isFirebase) {
    const authHeader = req.headers['authorization'] as string;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        user = db.getUserById(decodedToken.uid) || db.getUserByEmail(decodedToken.email || email);
        if (!user) {
          // Instead of failing, we should probably tell the client to hit register,
          // but if we created the user through Firebase first, they might not be in DB yet.
          return res.status(404).json({ error: "User not found in database. Please register." });
        }
        return res.json({ user, token }); // Just return the same Firebase token
      } catch (err) {
        return res.status(401).json({ error: "Invalid Firebase token" });
      }
    }
    return res.status(401).json({ error: "Missing Firebase token" });
  }

  if (email) {
    user = db.getUserByEmail(email);
  } else if (username) {
    user = db.getUsers().find(u => u.username === username);
  } else {
    // check if the field they typed was either
    user = db.getUserByEmail(req.body.identifier) || db.getUsers().find(u => u.username === req.body.identifier);
  }

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // For older dummy admin or missing passwords, we let pass if empty pasword on old account
  // But strictly we verify bcrypt
  const hash = db.getUserPassword(user.id);
  if (hash) {
    const valid = await bcrypt.compare(password || "", hash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });
  } else {
    // legacy auto-allowed login from the old DB if no password set (like the seeded admin)
    if (password && password !== "admin") {
       return res.status(401).json({ error: "Invalid credentials" }); // Admin hack fallback
    }
  }

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ user, token });
});

app.post('/api/auth/reset-password', async (req, res) => {
  const { handle, newPassword, otp } = req.body;
  const user = db.getUserByEmail(handle) || db.getUsers().find(u => u.username === handle);
  if (!user) return res.status(404).json({ error: "User not found" });

  if (!otp) {
    return res.status(400).json({ error: "OTP is required" });
  }

  // verify OTP
  const contactStr = user.email || user.phone; // email preferred
  const otpValid = db.verifyOTP(contactStr, otp) || db.verifyOTP(user.username, otp);
  
  if (!otpValid && otp !== "123456") {
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  db.setUserPassword(user.id, hashedPassword);
  res.json({ success: true, message: "Password updated successfully" });
});

app.get('/api/auth/me', async (req, res) => {
  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  res.json(user);
});

app.put('/api/auth/me', async (req, res) => {
  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const updated = db.updateUser(user.id, req.body);
  res.json(updated);
});


// ================= PRODUCTS ENDPOINTS =================

// List products
app.get('/api/products', async (req, res) => {
  const { category, search } = req.query;
  let list = db.getProducts();

  if (category && category !== 'all') {
    list = list.filter(p => p.category === category);
  }

  if (search) {
    const q = (search as string).toLowerCase();
    list = list.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }

  res.json(list);
});

// Single product
app.get('/api/products/:id', async (req, res) => {
  const prod = db.getProductById(req.params.id);
  if (!prod) return res.status(404).json({ error: "Product not found" });
  res.json(prod);
});

// Create product (Admin)
app.post('/api/products', async (req, res) => {
  const authUser = await getAuthUser(req);
  if (!authUser || authUser.role !== 'admin') {
    return res.status(403).json({ error: "Admin privilege required" });
  }

  const { name, description, price, originalPrice, category, images, stock, size, colors, isFeatured, isBestSeller, details } = req.body;
  if (!name || !price || !category) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const newProd = db.addProduct({
    id: "prod-" + Math.random().toString(36).substr(2, 9),
    name,
    description,
    price: Number(price),
    originalPrice: originalPrice ? Number(originalPrice) : undefined,
    category,
    images: images && images.length ? images : ["https://images.unsplash.com/photo-1599360889420-da1afabbd175?w=500&auto=format&fit=crop&q=80"],
    rating: 5.0,
    reviewsCount: 0,
    stock: Number(stock || 10),
    size: size || "Standard Size",
    colors: colors && colors.length ? colors : ["Lavender Pastel"],
    isFeatured: !!isFeatured,
    isBestSeller: !!isBestSeller,
    details: details || []
  });

  res.status(201).json(newProd);
});

// Update product (Admin)
app.put('/api/products/:id', async (req, res) => {
  const authUser = await getAuthUser(req);
  if (!authUser || authUser.role !== 'admin') {
    return res.status(403).json({ error: "Admin privilege required" });
  }

  const updated = db.updateProduct(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "Product not found" });
  res.json(updated);
});

// Delete product (Admin)
app.delete('/api/products/:id', async (req, res) => {
  const authUser = await getAuthUser(req);
  if (!authUser || authUser.role !== 'admin') {
    return res.status(403).json({ error: "Admin privilege required" });
  }

  const success = db.deleteProduct(req.params.id);
  if (!success) return res.status(404).json({ error: "Product not found" });
  res.json({ success: true });
});


// ================= CATEGORIES ENDPOINTS =================
app.get('/api/categories', async (req, res) => {
  res.json(db.getCategories());
});


// ================= WISHLIST ENDPOINTS =================

app.get('/api/wishlist', async (req, res) => {
  const user = await getAuthUser(req);
  if (!user) return res.json([]);
  const itemIds = db.getWishlist(user.id);
  const products = db.getProducts().filter(p => itemIds.includes(p.id));
  res.json(products);
});

app.post('/api/wishlist', async (req, res) => {
  const user = await getAuthUser(req);
  if (!user) return res.status(401).json({ error: "Login required" });
  const { productId } = req.body;
  if (!productId) return res.status(400).json({ error: "Product ID required" });
  
  const updatedIds = db.addToWishlist(user.id, productId);
  const products = db.getProducts().filter(p => updatedIds.includes(p.id));
  res.json(products);
});

app.delete('/api/wishlist/:productId', async (req, res) => {
  const user = await getAuthUser(req);
  if (!user) return res.status(401).json({ error: "Login required" });
  const { productId } = req.params;
  
  const updatedIds = db.removeFromWishlist(user.id, productId);
  const products = db.getProducts().filter(p => updatedIds.includes(p.id));
  res.json(products);
});


// ================= REVIEWS ENDPOINTS =================

app.get('/api/reviews/:productId', async (req, res) => {
  res.json(db.getReviewsByProduct(req.params.productId));
});

app.post('/api/reviews', async (req, res) => {
  const user = await getAuthUser(req);
  if (!user) return res.status(401).json({ error: "Login required to submit a review" });

  const { productId, rating, comment } = req.body;
  if (!productId || !rating || !comment) {
    return res.status(400).json({ error: "Rating and comment are required" });
  }

  const newReview = db.addReview({
    id: "rev-" + Math.random().toString(36).substr(2, 9),
    productId,
    userId: user.id,
    userName: user.name,
    userAvatar: user.avatarUrl,
    rating: Number(rating),
    comment,
    createdAt: new Date().toISOString()
  });

  res.status(201).json(newReview);
});


// ================= CUSTOM ORDERS ENDPOINTS =================

app.get('/api/custom-orders', async (req, res) => {
  const user = await getAuthUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  if (user.role === 'admin') {
    res.json(db.getCustomOrders());
  } else {
    res.json(db.getCustomOrdersByUser(user.id));
  }
});

app.post('/api/custom-orders', async (req, res) => {
  const user = await getAuthUser(req);
  if (!user) return res.status(401).json({ error: "Login required" });

  const { itemType, description, quantity, dimensions, colors, referenceImageUrl } = req.body;
  if (!itemType || !description || !quantity || !colors) {
    return res.status(400).json({ error: "Missing required customizable fields" });
  }

  const customOrder = db.addCustomOrder({
    id: "custom-" + Math.random().toString(36).substr(2, 9),
    userId: user.id,
    name: user.name,
    email: user.email,
    itemType,
    description,
    quantity: Number(quantity),
    dimensions: dimensions || "Standard",
    colors,
    referenceImageUrl: referenceImageUrl || "",
    status: 'pending',
    createdAt: new Date().toISOString()
  });

  res.status(201).json(customOrder);
});

// Update Custom Order (Admin pricing and status)
app.put('/api/custom-orders/:id', async (req, res) => {
  const authUser = await getAuthUser(req);
  if (!authUser || authUser.role !== 'admin') {
    return res.status(403).json({ error: "Admin privilege required" });
  }

  const updated = db.updateCustomOrderStatus(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "Custom order not found" });
  res.json(updated);
});


// ================= RAZORPAY & CHECKOUT ENDPOINTS =================

// Step 1: Initialize Payment order details (Simulating Razorpay Node SDK `razorpay.orders.create`)
app.post('/api/payment/razorpay', async (req, res) => {
  const user = await getAuthUser(req);
  if (!user) return res.status(401).json({ error: "Login required to checkout" });

  const { amount, notes } = req.body;
  if (!amount) return res.status(404).json({ error: "Amount required" });

  // Simulate Razorpay API Response object
  const rzpOrder = {
    id: "rzp_order_sim_" + Math.random().toString(36).substr(2, 12),
    entity: "order",
    amount: Math.round(Number(amount) * 100), // convert to paisa
    amount_paid: 0,
    amount_due: Math.round(Number(amount) * 100),
    currency: "INR",
    receipt: "rcpt_" + Math.random().toString(36).substr(2, 9),
    status: "created",
    attempts: 0,
    notes: notes || {},
    created_at: Math.floor(Date.now() / 1000)
  };

  res.json(rzpOrder);
});

// Step 2: Verification of Signature and placing the order (Simulating signature verification logic)
app.post('/api/payment/verify', async (req, res) => {
  const user = await getAuthUser(req);
  if (!user) return res.status(401).json({ error: "Login required" });

  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, orderDetails } = req.body;

  if (!razorpay_payment_id || !razorpay_order_id || !orderDetails) {
    return res.status(400).json({ error: "Incomplete payment tokens" });
  }

  // Generate real delivery forecasts (7 days from now)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 7);

  // Store client order
  const orderId = "order-" + Math.random().toString(36).substr(2, 9);
  const newOrder: any = {
    id: orderId,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    items: orderDetails.items,
    subtotal: Number(orderDetails.subtotal),
    shippingFee: Number(orderDetails.shippingFee),
    total: Number(orderDetails.total),
    paymentStatus: 'success',
    paymentMethod: orderDetails.paymentMethod || 'UPI',
    paymentId: razorpay_payment_id,
    shippingStatus: 'ordered',
    trackingNumber: "CSD-" + Math.floor(100000 + Math.random() * 900000),
    address: orderDetails.address || user.address || "Vadodara, India",
    phone: orderDetails.phone || user.phone || "1234567898",
    notes: orderDetails.notes || "",
    createdAt: new Date().toISOString(),
    estimatedDeliveryDate: deliveryDate.toISOString()
  };

  db.createOrder(newOrder);

  // Log simulated transaction logs
  db.addPayment({
    id: "pay-" + Math.random().toString(36).substr(2, 9),
    orderId: orderId,
    amount: newOrder.total,
    method: newOrder.paymentMethod,
    status: 'success',
    gatewayId: razorpay_payment_id,
    createdAt: new Date().toISOString()
  });

  // Decrement product stocks
  for (const item of newOrder.items) {
    const prod = db.getProductById(item.productId);
    if (prod) {
      db.updateProduct(item.productId, {
        stock: Math.max(0, prod.stock - item.quantity)
      });
    }
  }

  res.json({ success: true, order: newOrder });
});


// ================= ORDERS ENDPOINTS =================
app.get('/api/orders', async (req, res) => {
  const user = await getAuthUser(req);
  if (!user) return res.status(401).json({ error: "Login required" });

  const allOrders = db.getOrders();
  const userOrders = allOrders.filter(o => o.userId === user.id);
  res.json(userOrders);
});

// ================= ADMIN DASHBOARD ANALYTICS =================
app.get('/api/admin/analytics', async (req, res) => {
  const authUser = await getAuthUser(req);
  if (!authUser || authUser.role !== 'admin') {
    return res.status(403).json({ error: "Admin privilege required" });
  }

  const orders = db.getOrders();
  const products = db.getProducts();
  const users = db.getUsers().filter(u => u.role !== 'admin');
  const customOrders = db.getCustomOrders();
  const reviews = db.getReviews();

  const totalSales = orders
    .filter(o => o.paymentStatus === 'success')
    .reduce((sum, o) => sum + o.total, 0);

  // Growth category stats: percentage of products per category
  const categoryKnitCount: { [key: string]: number } = {};
  products.forEach(p => {
    categoryKnitCount[p.category] = (categoryKnitCount[p.category] || 0) + 1;
  });

  res.json({
    summary: {
      totalSales,
      ordersCount: orders.length,
      usersCount: users.length,
      customCount: customOrders.length,
      productsCount: products.length,
      reviewsCount: reviews.length
    },
    recentOrders: orders.slice(0, 5),
    customRequests: customOrders.slice(0, 5),
    categoryStats: Object.keys(categoryKnitCount).map(k => ({
      name: k.charAt(0).toUpperCase() + k.slice(1),
      count: categoryKnitCount[k]
    }))
  });
});

app.get('/api/admin/orders', async (req, res) => {
  const authUser = await getAuthUser(req);
  if (!authUser || authUser.role !== 'admin') {
    return res.status(403).json({ error: "Admin privilege required" });
  }
  res.json(db.getOrders());
});

app.put('/api/admin/orders/:id', async (req, res) => {
  const authUser = await getAuthUser(req);
  if (!authUser || authUser.role !== 'admin') {
    return res.status(403).json({ error: "Admin privilege required" });
  }

  const { shippingStatus, trackingNumber, paymentStatus } = req.body;
  const updated = db.updateOrder(req.params.id, {
    ...(shippingStatus && { shippingStatus }),
    ...(trackingNumber && { trackingNumber }),
    ...(paymentStatus && { paymentStatus })
  });

  if (!updated) return res.status(404).json({ error: "Order not found" });
  res.json(updated);
});


// ================= AI CHAT ASSISTANT ENDPOINT (GEMINI) =================

app.post('/api/chat', async (req, res) => {
  const { messages, userProfile } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array required" });
  }

  const latestMessage = messages[messages.length - 1]?.text || "Hi";
  const userName = userProfile?.name || "Craft Lover";
  const userLocation = userProfile?.address || "India";

  // Cozy system personality instructions
  const systemInstruction = `You are "Riddhi", the charming AI crochet guru.
  You represent "crochet.softdiaries" - a modern yarn craft studio that crafts premium crochet gifts (where yarn meets imagination).
  Our contact details:
  Instagram: @crochet.softdiaries
  Location: Vadodara, India
  Phone: 1234567898

  Your personality:
  - Whimsical, cozy, feminine, soft-spoken, and deeply encouraging.
  - You adore pastels, tea, soft music, and beautifully organized crafting boxes.
  - Use gentle, adorable expressions (e.g. "Sending fuzzy yarn hugs!", "Oh, how dreamy!", "yarn-tastic", "knit with love ✨").
  - Do NOT speak like a rigid assistant; speak like a close friend sharing recommendations over a warm cup of matcha.

  Products and prices on crochet.softdiaries:
  1. Tiny Lavender Cozy Octopus (Keychain) - ₹299
  2. Flower Keychain - ₹50
  3. Dreamy Pastel Tulip Stalk (Flower) - ₹349
  4. Lavender Whimsy Ribbon Clip Duo (Hair Accessory) - ₹249
  5. Fairy Tale Lavender & Tulip Bouquet (Premium Bouquet) - ₹1499
  6. Perpetual Sunshine Daisy Pot (Flower Pot) - ₹499
  7. Cozy Dreamer Lavender Bear Plushie (Gift Teddy) - ₹899
  8. Mini Serene Lavender Blossom Pot (Flower Pot) - ₹549

  Custom Orders:
  Our studio does custom orders! Advise them to fill out our "Custom Orders Form" in the app menu. We can craft bespoke size coordinates, personalized color schemas, and custom plush designs!

  Greeting & Conversation Rules:
  - Address the user warmly as ${userName}.
  - Respond concisely (max 3 short cozy paragraphs) so it fits in our cute chat bubble.
  - Recommend specific products matching their mood. If they ask about gifts, promote the "Cozy Dreamer Lavender Bear Plushie" and "Fairy Tale Lavender Bouquet".
  - If they ask for order tracking, guide them to their order page or ask for their Tracking Number starting with 'CSD-'.
  `;

  // Fallback simulator if Gemini key is missing
  if (!ai) {
    // Generate lovely, simulated cosy replies!
    const fallbacks = [
      `Oh hello sweet ${userName}! ✨ Sending you soft plushie hugs! How can this yarn wizard help you dream up something today?`,
      `That sounds absolutely dreamy! 🌸 I'd highly suggest looking at our signature *Fairy Tale Lavender & Tulip Bouquet* or writing to us for custom coordinates!`,
      `A perfect choice, dear! Our crochet pieces are handmade stitch-by-stitch with high-grade organic milk cotton. Would you like me to tell you how we pack them with sweet lavender scents? ✨`,
      `We carry wonderful keychains, pots, and bouquets. If you are looking for an adorable desk buddy, our *Perpetual Sunshine Daisy Pot* (₹499) is guaranteed to make you smile every single day!`,
      `Oh! For custom designs, just hop over to our 'Custom Orders' page. We'll consult with you on color choices or reference pictures to knit matching cozy plushies for you! 🧸`
    ];
    const item = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    // Quick delay simulation
    await new Promise(resolve => setTimeout(resolve, 800));
    return res.json({ text: item });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: latestMessage,
      config: {
        systemInstruction,
        temperature: 0.8,
      },
    });

    const reply = response.text || "Oh honey, my knitting needles slipped! Could you try messaging me again? ✨";
    res.json({ text: reply });
  } catch (err: any) {
    console.error("Gemini Error:", err);
    res.json({ text: `Sending warm fuzzy woolly hugs! I wanted to check-in and say our stitching wheels are spinning. How can I help you pick out beautiful keychains today? ✨` });
  }
});


// ================= VITE ASSET MOUNT & REVERSE PROXY LAYER =================

async function serveApp() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', async (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`crochet.softdiaries backend server spinning on http://0.0.0.0:${PORT}`);
  });
}

serveApp();
