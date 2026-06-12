import React, { useState, useEffect } from 'react';
import {
  Heart, ShoppingBag, ShieldCheck, Mail, MapPin, Sparkles, Star, HelpCircle, FileText, CheckCircle, ChevronDown, Trash, ArrowRight, CornerDownRight, CreditCard, User, AlertCircle, Phone, RefreshCw, Send, Lock, X
} from 'lucide-react';
import { Product, Order, CustomOrder, User as UserType } from './types';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LiveChat from './components/LiveChat';
import ShopView from './components/ShopView';
import AdminPanel from './components/AdminPanel';
import ProductDetailsModal from './components/ProductDetailsModal';

import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { db, auth } from './firebase';
import { doc, setDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';

export default function App() {
  // Global States
  const [activeTab, setActiveTab] = useState('home');
  const [darkMode, setDarkMode] = useState(false);
  const [cart, setCart] = useState<{ product: Product; quantity: number; color: string }[]>(() => {
    const saved = localStorage.getItem('softdairies_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    const saved = localStorage.getItem('softdairies_wishlist');
    return saved ? JSON.parse(saved) : [];
  });
  const [user, setUser] = useState<UserType | null>(() => {
    const saved = localStorage.getItem('softdairies_user');
    return saved ? JSON.parse(saved) : null;
  });

  // UI Modal overlays
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authOtpSent, setAuthOtpSent] = useState(false);
  const [authOtp, setAuthOtp] = useState('');
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('softdairies_token') || '');
  const [authError, setAuthError] = useState('');
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  
  // Custom Order Form state
  const [customType, setCustomType] = useState('Crochet Keychain');
  const [customDesc, setCustomDesc] = useState('');
  const [customQty, setCustomQty] = useState(1);
  const [customDim, setCustomDim] = useState('Standard');
  const [customCol, setCustomCol] = useState('Lavender and Cream Soft blends');
  const [customRefImg, setCustomRefImg] = useState('');
  const [customSuccess, setCustomSuccess] = useState(false);

  // Checkout form fields
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingPhone, setShippingPhone] = useState('');
  const [shippingNotes, setShippingNotes] = useState('');
  const [checkoutStep, setCheckoutStep] = useState<'details' | 'payment'>('details');
  const [selectedUPIApp, setSelectedUPIApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'card'>('gpay');
  const [rzpOrderSim, setRzpOrderSim] = useState<any>(null);
  const [payingSim, setPayingSim] = useState(false);
  const [orderTrackingNum, setOrderTrackingNum] = useState('');

  // Newsletter, contact, lists
  const [faqOpen, setFaqOpen] = useState<{ [key: number]: boolean }>({});
  const [conName, setConName] = useState('');
  const [conMail, setConMail] = useState('');
  const [conMsg, setConMsg] = useState('');
  const [conSuccess, setConSuccess] = useState(false);
  
  // Best sellers and featured products lists
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loadingProds, setLoadingProds] = useState(false);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('softdairies_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('softdairies_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('softdairies_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('softdairies_user');
    }
  }, [user]);

  // Dark Mode Syncing
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Fetch frontpage collections
  useEffect(() => {
    setLoadingProds(true);
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setBestSellers(data.filter((p: Product) => p.isBestSeller));
        setFeaturedProducts(data.filter((p: Product) => p.isFeatured));
        setLoadingProds(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingProds(false);
      });
  }, []);

  // Sync wishlist to backend on change, if logged in
  const syncWishlist = async (updatedWishlist: Product[]) => {
    if (!user) return;
    try {
      // Send batch wishlist update or simple trigger
      localStorage.setItem('softdairies_wishlist', JSON.stringify(updatedWishlist));
    } catch (e) {
      console.error(e);
    }
  };

  
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot_password'>('login');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);

    if (authMode === 'register') {
      if (!authEmail || !authName || !authPassword || !authConfirmPassword) {
        setAuthError("Email, Full Name, Password, and Confirm Password are required.");
        setIsLoading(false);
        return;
      }
      if (authPassword !== authConfirmPassword) {
        setAuthError("Passwords do not match.");
        setIsLoading(false);
        return;
      }
    } else if (authMode === 'forgot_password') {
      if (!authEmail) {
        setAuthError("Email is required.");
        setIsLoading(false);
        return;
      }
    }

    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(authEmail)) {
      setAuthError("Please provide a valid email format.");
      setIsLoading(false);
      return;
    }
    if (authMode === 'register' && authPassword.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      setIsLoading(false);
      return;
    }
    
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: authEmail, mode: authMode })
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Failed to send OTP.");
      } else {
        setAuthOtpSent(true);
        setResendCooldown(30);
        setAuthError("We've sent an OTP to your email! Please enter it to verify. It expires in 5 minutes.");
      }
    } catch {
      setAuthError("Network error sending OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);
    
    if (authMode === 'login') {
      if (!authEmail || !authPassword) {
        setAuthError("Email and Password are required.");
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: authEmail, password: authPassword })
        });
        const data = await res.json();
        
        if (!res.ok) {
          setAuthError(data.error || "Login failed");
        } else {
          setAuthData(data);
          setAuthModalOpen(false);
          resetAuthForms();
        }
      } catch (err: any) {
        setAuthError("Server sync error. Please try again.");
      }
    } else if (authMode === 'register') {
      if (!authOtpSent) {
         await handleSendOtp(e);
         return;
      }
      if (!authOtp || authOtp.length !== 6) {
        setAuthError("Exactly 6-digit OTP is required.");
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // Note: using authName as username fallback
          body: JSON.stringify({ email: authEmail, name: authName, phone: authPhone || '', password: authPassword, username: authName, otp: authOtp })
        });
        const data = await res.json();
        if (!res.ok) {
          setAuthError(data.error || "Signup failed");
        } else {
          setAuthData(data);
          setAuthModalOpen(false);
          resetAuthForms();
          alert("Account created successfully!");
        }
      } catch {
        setAuthError("Server sync error. Please try again.");
      }
    } else if (authMode === 'forgot_password') {
       if (!authOtpSent) {
         await handleSendOtp(e);
         return;
      }
      if (!authOtp || authOtp.length !== 6) {
        setAuthError("Exactly 6-digit OTP is required.");
        setIsLoading(false);
        return;
      }
      if (!authPassword || authPassword.length < 6) {
        setAuthError("New password must be at least 6 characters.");
        setIsLoading(false);
        return;
      }
      if (authPassword !== authConfirmPassword) {
        setAuthError("Passwords do not match.");
        setIsLoading(false);
        return;
      }
      
      try {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ handle: authEmail, newPassword: authPassword, otp: authOtp })
        });
        const data = await res.json();
        if (!res.ok) {
          setAuthError(data.error || "Password reset failed");
        } else {
          alert("Password updated successfully! Please log in.");
          setAuthMode('login');
          resetAuthForms();
        }
      } catch {
        setAuthError("Server sync error. Please try again.");
      }
    }
    
    setIsLoading(false);
  };

  const resetAuthForms = () => {
     setAuthEmail('');
     setAuthName('');
     setAuthPhone('');
     setAuthPassword('');
     setAuthConfirmPassword('');
     setAuthOtpSent(false);
     setAuthOtp('');
     setIsLoading(false);
  };

  const handleLogout = () => {
    setUser(null);
    setAuthToken('');
    setCart([]);
    setWishlist([]);
    setActiveTab('home');
    localStorage.removeItem('softdairies_user');
    localStorage.removeItem('softdairies_token');
  };

  // Add Item to Shopping cart
  const handleAddToCart = (product: Product, quantity: number, color: string) => {
    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex(
        (item) => item.product.id === product.id && item.color === color
      );
      if (existingIdx !== -1) {
        const copy = [...prevCart];
        copy[existingIdx].quantity += quantity;
        return copy;
      } else {
        return [...prevCart, { product, quantity, color }];
      }
    });

    // Provide pleasant feedback directly in console or UI dialog
  };

  // Toggle item in Wishlist
  const handleToggleWishlist = async (productId: string) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === productId);
      let nextList = [];
      if (exists) {
        nextList = prev.filter((p) => p.id !== productId);
        // Call backend API safely
        fetch(`/api/wishlist/${productId}`, {
          method: 'DELETE',
          headers: { 'x-user-id': user.id }
        });
      } else {
        const prod = bestSellers.find(p => p.id === productId) || featuredProducts.find(p => p.id === productId);
        if (prod) {
          nextList = [...prev, prod];
        } else {
          // fetch from server
          fetch(`/api/products/${productId}`)
            .then(res => res.json())
            .then(data => {
              setWishlist(w => [...w, data]);
            });
          nextList = [...prev];
        }

        fetch('/api/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user.id
          },
          body: JSON.stringify({ productId })
        });
      }
      syncWishlist(nextList);
      return nextList;
    });
  };

  // Subtotal details
  const getCartSubtotal = () => cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const getShippingFee = () => (getCartSubtotal() >= 999 || getCartSubtotal() === 0 ? 0 : 50);
  const getCartTotal = () => getCartSubtotal() + getShippingFee();

  // Custom Order Submission (Bespoke request)
  const handleCustomOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    if (!customDesc || !customCol) {
      setCustomDesc('Please provide stitching specifications in this box in order to submit.');
      return;
    }

    try {
      const res = await fetch('/api/custom-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({
          itemType: customType,
          description: customDesc,
          quantity: customQty,
          dimensions: customDim,
          colors: customCol,
          referenceImageUrl: customRefImg
        })
      });

      if (res.ok) {
        setCustomSuccess(true);
        setCustomDesc('');
        setCustomQty(1);
        setCustomDim('Standard');
        setCustomCol('Lavender soft pastel coordinates');
        setCustomRefImg('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Razorpay Checkout Simulation Trigger
  const handleTriggerCheckout = async () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    
    // Auto preset shipping address/phone from user profile
    setShippingAddress(user.address || '');
    setShippingPhone(user.phone || '');
    setCheckoutStep('details');
    setRzpOrderSim(null);
    setActiveTab('checkout');
  };

  const handleCheckoutDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingAddress || !shippingPhone) {
      setShippingAddress("Error: Missing constraints.");
      return;
    }

    setPayingSim(true);
    // Call server to initialize simulated Razorpay order
    try {
      const res = await fetch('/api/payment/razorpay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          amount: getCartTotal(),
          notes: {
            phone: shippingPhone,
            address: shippingAddress
          }
        })
      });

      const orderData = await res.json();
      setRzpOrderSim(orderData);
      setCheckoutStep('payment');
    } catch (err) {
      console.error(err);
    } finally {
      setPayingSim(false);
    }
  };

  const handleVerifyPayment = async () => {
    setPayingSim(true);
    try {
      const paymentId = "rzp_payment_sim_" + Math.random().toString(36).substr(2, 9);
      const signature = "rzp_sig_sim_" + Math.random().toString(36).substr(2, 20);

      const res = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          razorpay_payment_id: paymentId,
          razorpay_order_id: rzpOrderSim.id,
          razorpay_signature: signature,
          orderDetails: {
            items: cart.map(item => ({
              productId: item.product.id,
              name: item.product.name,
              price: item.product.price,
              quantity: item.quantity,
              image: item.product.images[0],
              color: item.color
            })),
            subtotal: getCartSubtotal(),
            shippingFee: getShippingFee(),
            total: getCartTotal(),
            paymentMethod: selectedUPIApp === 'card' ? 'Visa Card' : `UPI (${selectedUPIApp.toUpperCase()})`,
            address: shippingAddress,
            phone: shippingPhone,
            notes: shippingNotes
          }
        })
      });

      const verifyData = await res.json();
      if (verifyData.success) {
        try {
          if (auth.currentUser) {
            await setDoc(doc(db, 'orders', verifyData.order.id), {
              ...verifyData.order,
              firebaseUserId: auth.currentUser.uid
            });
            console.log("Order stored in Firebase!");
          }
        } catch (fbErr) {
          console.error("Failed to store in Firebase:", fbErr);
        }

        setOrderTrackingNum(verifyData.order.trackingNumber);
        setCart([]);
        setActiveTab('profile'); // Send them to order list to track!
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPayingSim(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col gradient-bg text-lavender-900 dark:text-lavender-50 transition-colors duration-200">
      
      {/* Header element */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cart.reduce((sum, i) => sum + i.quantity, 0)}
        wishlistCount={wishlist.length}
        user={user}
        onLogout={handleLogout}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {/* Main viewport */}
      <main className="flex-grow">
        
        {/* VIEW 1: HOME PAGE */}
        {activeTab === 'home' && (
          <div className="space-y-16 pb-16 animate-fade-in">
            
            {/* Hero Showcase Banner */}
            <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
              <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                <div className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-lavender-200 to-pink-200 opacity-40 sm:left-[calc(50%-30rem)] sm:w-[72rem]"></div>
              </div>

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
                
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-lavender-650 bg-lavender-50 dark:bg-white/5 dark:text-lavender-200 border border-lavender-100 dark:border-white/10 dark:backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5 text-lavender-400" />
                  Stitched with Whimsical Love in Vadodara
                </span>

                <h1 className="font-serif text-4xl sm:text-6xl font-extrabold text-zinc-800 dark:text-zinc-100 tracking-tight leading-none max-w-4xl mx-auto">
                  Where <span className="text-lavender-400 italic">yarn</span> meets <span className="text-pink-400">imagination</span>.
                </h1>

                <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
                  crochet.softdiaries shapes tender, premium handmade gifts designed to bring warmth, soft smiles, and cozy comfort into your special ones&apos; life.
                </p>

                <div className="flex justify-center gap-4 pt-4">
                  <button
                    onClick={() => setActiveTab('shop')}
                    className="px-6 py-3 rounded-full bg-lavender-400 hover:bg-lavender-500 hover:translate-y-[-1px] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all"
                  >
                    Explore Cozy Shop 🌸
                  </button>
                  <button
                    onClick={() => setActiveTab('custom-order')}
                    className="px-6 py-3 rounded-full border border-lavender-200 dark:border-zinc-700 hover:bg-lavender-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-white text-sm font-bold transition-all"
                  >
                    Bespoke Custom Orders
                  </button>
                </div>

                {/* Showcase Grid */}
                <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-md bg-zinc-100">
                    <img src="sunhairtie.jpeg" />
                  </div>
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-md bg-zinc-100 mt-4 md:mt-8">
                    <img src="Heart.jpeg" />
                  </div>
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-md bg-zinc-100">
                    <img src="evileye.jpeg" />
                  </div>
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-md bg-zinc-100 mt-4 md:mt-8">
                    <img src="bow.jpeg"/>
                  </div>
                </div>

              </div>
            </section>

            {/* Featured Best Sellers Collections */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-baseline mb-6 border-b pb-4">
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-800 dark:text-white">
                  Trending Best Sellers ✨
                </h2>
                <button onClick={() => setActiveTab('shop')} className="text-xs sm:text-sm font-bold text-lavender-500 hover:underline flex items-center gap-1">
                  View Shop Catalog <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {loadingProds ? (
                <div className="flex items-center justify-center py-10 text-zinc-400 text-xs">🧶 Spinning up best sellers...</div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {bestSellers.slice(0, 4).map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => setActiveProduct(prod)}
                      className="group soft-card p-3 rounded-[32px] hover:shadow-lg hover:scale-[1.01] transition-all cursor-pointer"
                    >
                      <div className="aspect-square rounded-xl overflow-hidden bg-zinc-100 relative mb-3">
                        <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover" />
                        <span className="absolute top-2 left-2 bg-pink-100 text-pink-600 font-serif text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full ring-1 ring-pink-200">
                          Polished ❀
                        </span>
                      </div>
                      <h3 className="font-serif font-bold text-sm text-zinc-800 dark:text-white leading-tight mb-1 truncate">{prod.name}</h3>
                      <p className="text-[10px] text-zinc-400 capitalize">{prod.category}</p>
                      <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-zinc-50">
                        <span className="text-sm font-bold text-lavender-500">₹{prod.price}</span>
                        <span className="text-[10px] font-bold text-zinc-450 hover:text-lavender-500 decoration-lavender-400 flex items-center gap-1">View Detail</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Why Handmade Section */}
            <section className="bg-lavender-50/50 dark:bg-[#1a1525]/80 dark:backdrop-blur-md py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  <div className="space-y-6">
                    <span className="text-xs uppercase font-extrabold tracking-widest text-[#a855f7]">Stitched with dedication</span>
                    <h2 className="font-serif text-3xl sm:text-4xl font-bold text-zinc-800 dark:text-white leading-tight">Every single knot tells our warm rustic story.</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      crochet.softdiaries was built by hand out of Vadodara, India, with the mission to build things that matter. Unlike bulk machines, our knit pieces carry personal touch, smooth cotton texture, and are beautifully customized to make people feel cherished.
                    </p>
                    <div className="grid grid-cols-2 gap-4 pb-2">
                      <div className="p-3 soft-card rounded-[24px]">
                        <p className="font-bold text-lavender-500 font-serif text-md">100% Eco-Wool</p>
                        <p className="text-[11px] text-zinc-400 mt-1">Premium safe anti-pilling blend yarns</p>
                      </div>
                      <div className="p-3 soft-card rounded-[24px]">
                        <p className="font-bold text-pink-400 font-serif text-md">Custom schema</p>
                        <p className="text-[11px] text-zinc-400 mt-1">Made specifically with your colors</p>
                      </div>
                    </div>
                  </div>
                  <div className="aspect-16/10 rounded-3xl overflow-hidden shadow-xl bg-white dark:bg-white/5 dark:backdrop-blur-md dark:border dark:border-white/10 p-6 flex items-center justify-center">
                    <img src="logo.jpeg" alt="Logo" className="w-full h-full object-contain" />
                  </div>
                </div>
              </div>
            </section>

          </div>
        )}

        {/* VIEW 2: SHOP PORTAL */}
        {activeTab === 'shop' && (
          <ShopView
            user={user}
            onAddToCart={handleAddToCart}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            onViewProduct={setActiveProduct}
          />
        )}

        {/* VIEW 3: INSPIRATIONAL GALLERY */}
        {activeTab === 'gallery' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
            <div className="text-center max-w-xl mx-auto">
              <h1 className="font-serif text-3xl font-extrabold text-zinc-800 dark:text-white mb-2">🌸 Pinterest Lookbook Feed 🌸</h1>
              <p className="text-xs text-zinc-400 font-medium">✨ @crochet.softdiaries curated board. Snap and tag us on Instagram for features!</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { url: "bigrose.jpeg" },
                { url: "boq.jpeg" },
                { url: "bow.jpeg" },
                { url: "evileye.jpeg" },
                { url: "evileyewith hanging.jpeg" },
                { url: "flower.jpeg" },
                { url: "headband.jpeg" },
                { url: "Heart.jpeg" },
                { url: "minirose.jpeg" },
                { url: "mobp.jpeg" },
                { url: "mobpc.jpeg" },
                { url: "moby.jpeg" },
                { url: "sun.jpeg" },
                { url: "sunflower.jpeg" },
                { url: "sunhairtie.jpeg" }
              ].map((item, idx) => (
                <div key={idx} className="group relative rounded-2xl overflow-hidden shadow-sm bg-zinc-100 hover:shadow-lg transition-shadow">
                  <img src={item.url} alt="lookbook" className="w-full aspect-square object-cover" />
                  <div className="absolute inset-0 bg-zinc-950/40 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-white text-xs">
                    <span className="text-[10px] font-bold text-lavender-200">{item.tag}</span>
                    <p className="mt-1 font-medium italic">“ {item.caption} ”</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 4: CUSTOM BESPOKE ORDERS REQUEST FORM */}
        {activeTab === 'custom-order' && (
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 animate-fade-in">
            <div className="rounded-[32px] soft-card p-6 sm:p-8 space-y-6">
              
              <div className="text-center space-y-2">
                <span className="text-2xl">🧸</span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-800 dark:text-white">Bespoke Stitch Inquiries</h2>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-normal">
                  Got a specific color scheme, custom size, or Pinterest sketch in mind? Complete this sheet and our studio will quote a price estimate!
                </p>
              </div>

              {customSuccess ? (
                <div className="p-6 text-center bg-green-50 rounded-2xl border border-green-100 space-y-3 animate-zoom-in">
                  <CheckCircle className="w-10 h-10 text-green-500 mx-auto" />
                  <h3 className="font-serif font-bold text-base text-zinc-700">Inquiry Received Successfully!</h3>
                  <p className="text-xs text-zinc-500 leading-normal max-w-xs mx-auto">
                    We have notified Admin Riddhi! Check your profile or orders page shortly to view your approved customized price quote.
                  </p>
                  <button
                    onClick={() => {
                      setCustomSuccess(false);
                      setActiveTab('profile');
                    }}
                    className="mt-2 px-6 py-2 rounded-full bg-green-500 text-white text-xs font-bold hover:bg-green-600 transition-colors"
                  >
                    View Customized List
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCustomOrderSubmit} className="space-y-4 text-xs font-semibold text-zinc-650">
                  
                  <div>
                    <label className="block text-zinc-400 mb-1">Crochet Styling Core:</label>
                    <select
                      value={customType}
                      onChange={(e) => setCustomType(e.target.value)}
                      className="w-full p-3 rounded-xl border bg-zinc-50/50 dark:bg-zinc-800 dark:text-white outline-none"
                    >
                      <option value="Crochet Keychain">Crochet Keychain Charm</option>
                      <option value="Crochet Bouquet">Hand-wrapped Bouquet</option>
                      <option value="Custom Flower Pot">Mini Green Potted Pot</option>
                      <option value="Hair clip or Bow">Hair Clips / Silk clips</option>
                      <option value="Custom Plush Toy">Fluffy Bear / Custom Plushie</option>
                      <option value="Special customized combination">Custom Gift Bundle Box</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-zinc-400 mb-1">Quantity (pieces):</label>
                      <input
                        type="number"
                        min={1}
                        value={customQty}
                        onChange={(e) => setCustomQty(Number(e.target.value))}
                        className="w-full p-3 rounded-xl border bg-zinc-50/50 dark:bg-zinc-800 dark:text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1">Desired Dimensions:</label>
                      <input
                        type="text"
                        value={customDim}
                        onChange={(e) => setCustomDim(e.target.value)}
                        placeholder="e.g., 12cm tall / Pocket size"
                        className="w-full p-3 rounded-xl border bg-zinc-50/50 dark:bg-zinc-800 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1">Preferred Pastel Color Scheme:</label>
                    <input
                      type="text"
                      required
                      value={customCol}
                      onChange={(e) => setCustomCol(e.target.value)}
                      placeholder="e.g., Soft Mint Green with buttery yellow borders"
                      className="w-full p-3 rounded-xl border bg-zinc-50/50 dark:bg-zinc-800 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1">Upload Reference Sketch/Image URL:</label>
                    <input
                      type="text"
                      value={customRefImg}
                      onChange={(e) => setCustomRefImg(e.target.value)}
                      placeholder="Paste Pinterest/Unsplash image address..."
                      className="w-full p-3 rounded-xl border bg-zinc-50/50 dark:bg-zinc-800 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1">Describe Stitch specs & Personalizations:</label>
                    <textarea
                      rows={4}
                      required
                      value={customDesc}
                      onChange={(e) => setCustomDesc(e.target.value)}
                      placeholder="Please request letters, names, scarp colors, or extra gift tags..."
                      className="w-full p-3 rounded-xl border bg-zinc-50/50 dark:bg-zinc-800 dark:text-white focus:outline-none"
                    />
                  </div>

                  <button
                    id="custom-order-form-submit-btn"
                    type="submit"
                    className="w-full py-3 rounded-xl bg-lavender-400 hover:bg-lavender-500 text-white font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <FileText className="w-4 h-4" />
                    Submit Stitch Inquiry
                  </button>

                </form>
              )}

            </div>
          </div>
        )}

        {/* VIEW 5: ABOUT US BRAND STORY */}
        {activeTab === 'about' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 animate-fade-in space-y-12">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-zinc-800 dark:text-white">Our Hand-Stitched Story 🌸</h1>
              <p className="text-xs text-zinc-400 italic">“Where yarn meets imagination.”</p>
            </div>

            <div className="p-6 soft-card rounded-[32px] grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="bg-white dark:bg-white/5 dark:backdrop-blur-md dark:border dark:border-white/10 rounded-[24px] p-6 flex items-center justify-center shadow-inner">
                <img src="logo.jpeg" alt="Logo" className="w-full max-h-80 object-contain rounded-xl" />
              </div>
              <div className="space-y-4">
                <h3 className="font-serif text-xl font-bold text-zinc-800 dark:text-zinc-100">Handmade with Love & Dreaminess</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  crochet.softdiaries launched as a tiny home workshop in Vadodara, India. Our goal was simple: replace mass-produced factory items with warm, custom-stitched cozy items that carry soul.
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Every plush bear, keychain charm and tulip stalk is handmade petal by petal, knot by knot, integrating safety materials, soft velvet wool, and delicate packaging that smells like fresh lilac.
                </p>
                <div className="flex items-center gap-3 bg-lavender-50/50 p-3 rounded-xl">
                  <span className="text-xl">🍵</span>
                  <span className="text-[10px] text-zinc-400 font-bold leading-normal">Our boutique pairs knitting needles with warm matcha tea and cozy jazz playlists. It reflects in the peaceful, elegant shapes we design.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 6: CONTACT INFORMATION */}
        {activeTab === 'contact' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 animate-fade-in space-y-8">
            <div className="text-center">
              <h1 className="font-serif text-3xl font-bold text-zinc-800 dark:text-white">Get in Touch ❀</h1>
              <p className="text-xs text-zinc-400 mt-1">We love corresponding with fellow yarn lovers!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Contact card */}
              <div className="p-6 rounded-[32px] soft-card space-y-4">
                <h3 className="font-serif text-lg font-bold text-zinc-800 dark:text-white">Vadodara Flagship Studio</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Drop by our studio for sweet smelling knit displays and local collection restocks.
                </p>

                <div className="space-y-3.5 text-xs text-zinc-650">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-5 h-5 text-lavender-400 shrink-0 mt-0.5" />
                    <span>Vadodara, Gujarat, India - 390025</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-lavender-400 shrink-0" />
                    <span>+91 7016917377</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-lavender-400 shrink-0" />
                    <span>hello@softdairies.com</span>
                  </div>
                </div>

                <div className="pt-2 border-t text-[10px] text-zinc-400 font-bold flex items-center gap-1">
                  <span>✨ Instagram DM Support:</span>
                  <a href="https://instagram.com/crochet.softdiaries" target="_blank" rel="noreferrer" className="text-lavender-500 hover:underline">@crochet.softdiaries</a>
                </div>
              </div>

              {/* Message form */}
              <div className="p-6 rounded-[32px] soft-card">
                <h3 className="font-serif text-lg font-bold text-zinc-800 dark:text-white mb-4">Send an Instant Note</h3>
                
                {conSuccess ? (
                  <div className="py-8 text-center bg-green-50 rounded-2xl border border-green-105 space-y-2">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
                    <p className="text-xs font-semibold text-zinc-700">Message Dispatched! ✨</p>
                    <p className="text-[10px] text-zinc-400">Riddhi will correspond with you via email within 24 hours.</p>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setConSuccess(true);
                      setConName('');
                      setConMail('');
                      setConMsg('');
                      setTimeout(() => setConSuccess(false), 5000);
                    }}
                    className="space-y-3 text-xs font-semibold text-zinc-550"
                  >
                    <div>
                      <label className="block mb-1 text-zinc-400">Your Full Name:</label>
                      <input
                        type="text"
                        required
                        value={conName}
                        onChange={(e) => setConName(e.target.value)}
                        placeholder="e.g., Ishita"
                        className="w-full p-2.5 bg-zinc-50/50 dark:bg-zinc-800 dark:text-white outline-none rounded-xl border border-lavender-100"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-zinc-400">Your Email Address:</label>
                      <input
                        type="email"
                        required
                        value={conMail}
                        onChange={(e) => setConMail(e.target.value)}
                        placeholder="e.g., ishita@gmail.com"
                        className="w-full p-2.5 bg-zinc-50/50 dark:bg-zinc-800 dark:text-white outline-none rounded-xl border border-lavender-100"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-zinc-400">Write Your Story / Query:</label>
                      <textarea
                        rows={3}
                        required
                        value={conMsg}
                        onChange={(e) => setConMsg(e.target.value)}
                        placeholder="What designs make you smile?"
                        className="w-full p-2.5 bg-zinc-50/50 dark:bg-zinc-800 dark:text-white outline-none rounded-xl border border-lavender-100"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-full bg-lavender-400 hover:bg-lavender-500 text-white font-bold transition-all"
                    >
                      Dispatch Note ❀
                    </button>
                  </form>
                )}
              </div>

            </div>
          </div>
        )}

        {/* VIEW 7: FREQUENTLY ASKED QUESTIONS */}
        {activeTab === 'faq' && (
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 animate-fade-in space-y-6">
            <div className="text-center space-y-1 mb-4">
              <h1 className="font-serif text-3xl font-bold text-zinc-800 dark:text-white">Care & Query FAQS ❀</h1>
              <p className="text-xs text-zinc-400 font-medium">Have queries on washing instructions or courier frames?</p>
            </div>

            {[
              { q: "How do I care for and wash my crochet flowers/plushies?", a: "Please wash them gently by hand in cool water using dynamic mild soap. Do not wring or spin; lay them flat on dry towels to air dry. This protects wool structures perfectly." },
              { q: "What is the shipping cost and courier turnaround?", a: "Shipping is absolutely FREE across India for invoices over ₹999. Under ₹999, we charge a flat local rate of ₹50. Standard deliveries within Vadodara take 2 days, and other locations take 5-7 days." },
              { q: "How are the custom order quote prices generated?", a: "Quotations depend on the complexity of stitches, quantity of yarn, and dimensions required. Upon form submission, Admin Riddhi calculates quotes and lists the final customizable price on your profile sheet." },
              { q: "What premium materials do you use?", a: "We strictly stitch with premium double-knit milk cotton yarn (blended from cotton & milk protein fiber). It is hypoallergenic, incredibly soft to pick up, and does not pill easily." }
            ].map((faq, idx) => {
              const isFaqOpen = !!faqOpen[idx];
              return (
                <div key={idx} className="soft-card rounded-[24px] overflow-hidden transition-colors">
                  <button
                    onClick={() => setFaqOpen({ ...faqOpen, [idx]: !isFaqOpen })}
                    className="w-full p-4 flex justify-between items-center text-left text-xs font-extrabold text-zinc-700 dark:text-white uppercase tracking-wider"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-lavender-400 transition-transform ${isFaqOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isFaqOpen && (
                    <div className="p-4 pt-1 border-t border-dashed border-lavender-50 text-xs text-zinc-550 dark:text-zinc-400 leading-relaxed font-medium">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW 8: SHOPPING CART */}
        {activeTab === 'cart' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 animate-fade-in space-y-8">
            <h1 className="font-serif text-2xl font-bold text-zinc-800 dark:text-white">Your Whimsical Shopping Bag</h1>

            {cart.length === 0 ? (
              <div className="p-12 text-center rounded-[32px] soft-card p-6 flex flex-col items-center gap-3">
                <span className="text-3xl">🛒</span>
                <p className="font-serif italic text-sm text-zinc-405">Your shopping bag is completely empty...</p>
                <button
                  onClick={() => setActiveTab('shop')}
                  className="px-6 py-2 rounded-full bg-lavender-400 text-white text-xs font-bold hover:bg-lavender-500 transition-colors mt-2"
                >
                  Browse Cozy Knits
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* List items */}
                <div className="lg:col-span-2 space-y-4">
                  {cart.map((item, idx) => (
                    <div key={idx} className="p-4 soft-card rounded-[32px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img src={item.product.images[0]} alt={item.product.name} className="w-16 h-16 rounded-xl object-cover border" />
                        <div className="font-medium text-xs">
                          <p className="font-serif font-bold text-sm text-zinc-800 dark:text-zinc-150">{item.product.name}</p>
                          <p className="text-zinc-400">Color option: <span className="text-lavender-500 font-bold">{item.color}</span></p>
                          <p className="font-bold text-zinc-700 dark:text-zinc-300 mt-1">₹{item.product.price} <span className="font-normal text-[10px] text-zinc-400">x {item.quantity}</span></p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          onClick={() => {
                            setCart((prev) => prev.filter((_, i) => i !== idx));
                          }}
                          className="p-2 text-zinc-400 hover:text-red-500 rounded-full"
                          title="Hide item"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotals card */}
                <div className="p-6 rounded-[32px] soft-card h-fit space-y-4 text-xs font-semibold text-zinc-650">
                  <h3 className="font-serif font-bold text-base text-zinc-800 dark:text-white">Invoice Summary</h3>
                  
                  <div className="space-y-2 border-b pb-3">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Handmade Subtotal</span>
                      <span>₹{getCartSubtotal()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Delivery Fee (India)</span>
                      <span>{getShippingFee() === 0 ? 'FREE' : `₹${getShippingFee()}`}</span>
                    </div>
                    {getShippingFee() > 0 && (
                      <p className="text-[9px] text-emerald-500 font-bold leading-normal">❀ Shop for ₹{999 - getCartSubtotal()} more to unlock FREE delivery!</p>
                    )}
                  </div>

                  <div className="flex justify-between font-bold text-sm text-lavender-500">
                    <span>Grand Total</span>
                    <span>₹{getCartTotal()}</span>
                  </div>

                  {/* Delivery prediction */}
                  <div className="p-3 bg-lavender-50/50 dark:bg-zinc-800/40 rounded-xl text-[10px] leading-relaxed text-zinc-500">
                    🚚 <span className="font-bold text-lavender-600 dark:text-lavender-305">Estimated Delivery Date:</span> Inside 7 working days from Vadodara (approx. May 27, 2026).
                  </div>

                  <button
                    id="checkout-bag-btn"
                    onClick={handleTriggerCheckout}
                    className="w-full py-3 bg-lavender-400 hover:bg-lavender-500 text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1"
                  >
                    Proceed to Simulated Checkout <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            )}
          </div>
        )}

        {/* VIEW 9: WISHLIST PORTAL */}
        {activeTab === 'wishlist' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 animate-fade-in space-y-6">
            <h1 className="font-serif text-2xl font-bold text-zinc-800 dark:text-white">Your Saved Bookmarks</h1>

            {wishlist.length === 0 ? (
              <div className="p-12 text-center rounded-[32px] soft-card p-6 flex flex-col items-center gap-3">
                <Heart className="w-10 h-10 text-pink-300" />
                <p className="font-serif italic text-sm text-zinc-405">You haven&apos;t bookmarked any designs yet...</p>
                <button
                  onClick={() => setActiveTab('shop')}
                  className="px-6 py-2 rounded-full bg-lavender-400 text-white text-xs font-bold hover:bg-lavender-505 transition-colors mt-2"
                >
                  Browse Cozy Options
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {wishlist.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => setActiveProduct(prod)}
                    className="group bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-lavender-100 font-medium text-xs flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-square rounded-xl overflow-hidden bg-zinc-50 relative mb-2">
                      <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleWishlist(prod.id);
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-white text-pink-400 hover:scale-105 shadow-xs"
                      >
                        <Heart className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>
                    <h3 className="font-serif font-bold text-zinc-800 dark:text-white line-clamp-1">{prod.name}</h3>
                    <p className="text-[10px] text-zinc-400 capitalize">{prod.category}</p>
                    
                    <div className="flex items-center justify-between mt-2 pt-2 border-t font-semibold">
                      <span className="text-lavender-500 font-bold">₹{prod.price}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(prod, 1, prod.colors[0] || 'Lavender Pastel');
                          // Remove from wishlist
                          handleToggleWishlist(prod.id);
                        }}
                        className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-lavender-50 text-lavender-600 hover:bg-lavender-450 hover:text-white transition-colors shrink-0"
                      >
                        + Add To Bag
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 10: CHECKOUT RAZORPAY BILLING */}
        {activeTab === 'checkout' && (
          <div className="max-w-2xl mx-auto px-4 py-12 animate-fade-in">
            <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-lavender-100 p-6 sm:p-8 space-y-6">
              
              <div className="text-center space-y-1">
                <span className="text-2xl">💸</span>
                <h2 className="font-serif text-2xl font-bold text-zinc-800 dark:text-white">Razorpay Secure Checkout</h2>
                <p className="text-xs text-zinc-400">UPI, Google Pay, PhonePe, and Card payment solutions supported.</p>
              </div>

              {checkoutStep === 'details' ? (
                <form onSubmit={handleCheckoutDetailsSubmit} className="space-y-4 text-xs font-semibold text-zinc-650">
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#742bf4]">1. Shipping Destination Details</h3>
                  
                  <div>
                    <label className="block text-zinc-400 mb-1">Receiver Mobile Phone Number:</label>
                    <input
                      type="tel"
                      required
                      value={shippingPhone}
                      onChange={(e) => setShippingPhone(e.target.value)}
                      placeholder="Enter 10-digit phone number"
                      className="w-full p-3 border rounded-xl bg-zinc-50/50 dark:bg-zinc-800 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1">Full Courier Delivery Address:</label>
                    <textarea
                      rows={3}
                      required
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="Street address, City (e.g. Vadodara), State, PIN Code"
                      className="w-full p-3 border rounded-xl bg-zinc-50/50 dark:bg-zinc-800 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1">Note to Stitcher (Optional):</label>
                    <input
                      type="text"
                      value={shippingNotes}
                      onChange={(e) => setShippingNotes(e.target.value)}
                      placeholder="Color preferences, Gift tags, letter wishes..."
                      className="w-full p-3 border rounded-xl bg-zinc-50/50 dark:bg-zinc-800"
                    />
                  </div>

                  <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-850 p-4 rounded-2xl">
                    <span className="font-serif font-bold text-sm">Invoice Grand Total:</span>
                    <span className="text-xl font-bold text-lavender-500">₹{getCartTotal()}</span>
                  </div>

                  <button
                    type="submit"
                    disabled={payingSim}
                    className="w-full py-3 bg-lavender-400 hover:bg-lavender-500 text-white font-bold rounded-xl transition-all shadow-sm"
                  >
                    {payingSim ? 'Registering with checkout...' : 'Proceed to Razorpay secure payment gateway 🔒'}
                  </button>
                </form>
              ) : (
                <div className="p-4 rounded-3xl bg-lavender-50/50 border border-lavender-100 space-y-4 animate-slide-up">
                  <div className="flex justify-between items-center border-b pb-3">
                    <span className="text-xs font-bold text-zinc-600">Checkout Complete Payment</span>
                    <span className="text-xs font-extrabold text-lavender-650 font-mono tracking-tight">{rzpOrderSim?.id}</span>
                  </div>

                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Payment Details</h3>
                  <div className="p-4 rounded-2xl bg-white dark:bg-zinc-800 text-center border">
                    <p className="text-sm font-semibold text-zinc-650 text-wrap">Please pay exactly <span className="font-bold text-lavender-500">₹{getCartTotal()}</span> via GPay to the ID below:</p>
                    <div className="bg-zinc-50 dark:bg-zinc-900 border p-3 rounded-lg mt-3 mb-3 font-mono font-bold text-base text-lavender-650 w-fit mx-auto cursor-text select-all">
                      riddhip3826@okhdfcbank
                    </div>
                    <p className="text-xs text-zinc-400">After successfully transferring the amount, click the button below to place your order.</p>
                  </div>

                  <div className="p-3 shadow-xs rounded-xl bg-white flex justify-between items-center text-xs">
                    <span className="font-bold text-zinc-650">Grand Billing Amount:</span>
                    <span className="text-lg font-bold font-serif text-lavender-500">₹{getCartTotal()}</span>
                  </div>

                  <button
                    id="submit-payment-btn"
                    onClick={handleVerifyPayment}
                    disabled={payingSim}
                    className="w-full py-3.5 rounded-full bg-lavender-400 hover:bg-lavender-505 hover:shadow-lg text-white font-bold text-sm transition-all"
                  >
                    {payingSim ? 'Placing Order...' : `I have paid ₹${getCartTotal()} - Place Order 🌸`}
                  </button>

                  <button
                    onClick={() => setCheckoutStep('details')}
                    className="w-full text-center text-xs text-zinc-450 hover:underline pt-2 font-semibold"
                  >
                    Change shipping address details
                  </button>

                </div>
              )}

            </div>
          </div>
        )}

        {/* VIEW 11: USER PROFILE & ORDER TRACKING MILESTONES */}
        {activeTab === 'profile' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 animate-fade-in space-y-8">
            {user ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Profile panel */}
                <div className="p-6 bg-white dark:bg-zinc-900 border border-lavender-105 rounded-3xl h-fit space-y-5">
                  <div className="text-center space-y-2">
                    <img
                      src={user.avatarUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80"}
                      alt={user.name}
                      className="w-16 h-16 rounded-full mx-auto border object-cover shadow-xs"
                    />
                    <div>
                      <h3 className="font-serif font-bold text-lg text-zinc-800 dark:text-white">{user.name}</h3>
                      <p className="text-xs text-zinc-400">{user.email}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-dashed border-lavender-100 text-xs font-semibold text-zinc-650 space-y-3">
                    <h4 className="text-[10px] font-extrabold uppercase tracking-wide text-zinc-400 mb-1">SAVED SHIPPING SPECS:</h4>
                    <p className="text-zinc-550 leading-relaxed"><span className="text-zinc-400">Address:</span> {user.address || 'Vadodara, India'}</p>
                    <p><span className="text-zinc-400">Mobile Phone:</span> {user.phone || '+91'}</p>
                    
                    <button
                      onClick={() => {
                        const newAddr = prompt("Update your shipping address:", user.address || '');
                        const newPh = prompt("Update your phone number:", user.phone || '');
                        if (newAddr !== null || newPh !== null) {
                          fetch('/api/auth/me', {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                              'x-user-id': user.id
                            },
                            body: JSON.stringify({
                              address: newAddr || user.address,
                              phone: newPh || user.phone
                            })
                          })
                            .then(res => res.json())
                            .then(updated => {
                              setUser(updated);
                            });
                        }
                      }}
                      className="w-full py-2 rounded-full border border-lavender-200 hover:bg-lavender-50 transition-colors text-zinc-700 inline-block text-center font-bold"
                    >
                      Update Profile Specs
                    </button>
                  </div>
                </div>

                {/* Orders tracking milestones column */}
                <div className="md:col-span-2 space-y-6">
                  
                  {/* Order tracking list */}
                  <div className="bg-white dark:bg-zinc-900 border border-lavender-100 rounded-3xl p-6 space-y-4">
                    <h3 className="font-serif text-xl font-bold text-zinc-800 dark:text-white">Your Handcrafted Restocks Tracking</h3>
                    
                    {/* Fetch order lists specifically from server */}
                    <OrderListContainer userId={user.id} />
                  </div>

                  {/* Custom Orders list */}
                  <div className="bg-white dark:bg-zinc-900 border border-lavender-100 rounded-3xl p-6 space-y-4">
                    <h3 className="font-serif text-xl font-bold text-zinc-800 dark:text-white">Personalized Custom Creations Summary</h3>
                    
                    <CustomOrderListContainer userId={user.id} />
                  </div>

                </div>

              </div>
            ) : (
              <div className="p-12 text-center bg-white border rounded-3xl max-w-sm mx-auto space-y-3">
                <AlertCircle className="w-10 h-10 text-lavender-400 mx-auto" />
                <h3 className="font-serif font-bold text-base text-zinc-700">Account Required</h3>
                <p className="text-xs text-zinc-450 leading-normal mb-2">Please login or register to track details or place custom restocks! ❀</p>
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="px-6 py-2 rounded-full bg-lavender-400 text-white font-bold text-xs hover:bg-lavender-505 transition-colors"
                >
                  Onboard On-The-Fly
                </button>
              </div>
            )}
          </div>
        )}

        {/* VIEW 12: ADMIN COUTY PANELS (LIVELY ONLY IF APPROVED) */}
        {activeTab === 'admin' && (
          <AdminPanel user={user} />
        )}

      </main>

      {/* FOOTER SYSTEM */}
      <Footer setActiveTab={setActiveTab} />

      {/* FLOATING ARTIFICIAL INTELLIGENCE CHAT ASSIST */}
      <LiveChat user={user} />

      {/* OVERLAY 1: DREAMS AUTH MODAL */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-xs" onClick={() => setAuthModalOpen(false)} />
          
          <div className="relative soft-card dark:backdrop-blur-2xl p-6 sm:p-8 rounded-3xl w-full max-w-md animate-zoom-in space-y-4 shadow-2xl">
            <button
              onClick={() => setAuthModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-lavender-50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <span className="text-2xl">🌸</span>
              <h3 className="font-serif font-bold text-xl text-zinc-800 dark:text-white">
                {authMode === 'login' ? 'Welcome Back' : authMode === 'register' ? 'Create Account' : 'Reset Password'}
              </h3>
              <p className="text-xs text-zinc-400">
                {authMode === 'login' ? 'Sign in to your account' : authMode === 'register' ? 'Join our creative circle' : 'Recover your account access'}
              </p>
            </div>

            <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 mb-4 rounded-full">
              <button
                className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-colors ${authMode === 'login' ? 'bg-white dark:bg-zinc-700 shadow flex items-center justify-center text-zinc-800 dark:text-white' : 'text-zinc-500 hover:text-zinc-700'}`}
                onClick={() => { setAuthMode('login'); setAuthError(''); setAuthOtpSent(false); }}
              >
                Sign In
              </button>
              <button
                className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-colors ${authMode === 'register' ? 'bg-white dark:bg-zinc-700 shadow flex items-center justify-center text-zinc-800 dark:text-white' : 'text-zinc-500 hover:text-zinc-700'}`}
                onClick={() => { setAuthMode('register'); setAuthError(''); setAuthOtpSent(false); }}
              >
                Sign Up
              </button>
            </div>

            {authError && <p className="text-xs text-red-500 bg-red-50 p-2 rounded-xl text-center font-medium">⚠️ {authError}</p>}

            <form onSubmit={handleAuthSubmit} className="space-y-3.5 text-xs font-semibold text-zinc-650">
              
              {!authOtpSent && authMode === 'register' && (
                <div>
                  <label className="block text-zinc-400 mb-1">Full Name <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full p-2.5 border rounded-xl dark:bg-zinc-800 focus:outline-none"
                  />
                </div>
              )}

              <div>
                 <label className="block text-zinc-400 mb-1">Email <span className="text-red-400">*</span></label>
                 <input
                   type="email"
                   required
                   disabled={authOtpSent && authMode !== 'login'}
                   value={authEmail}
                   onChange={(e) => setAuthEmail(e.target.value)}
                   placeholder="e.g. hello@example.com"
                   className={`w-full p-2.5 border rounded-xl dark:bg-zinc-800 focus:outline-none disabled:opacity-50 ${authEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authEmail) ? 'border-red-300' : ''}`}
                 />
              </div>

              {((authMode === 'login') || (authMode === 'register' && !authOtpSent) || (authMode === 'forgot_password' && authOtpSent)) && (
                 <div>
                   <label className="block text-zinc-400 mb-1">
                     {authMode === 'forgot_password' ? 'New Password' : 'Password'} <span className="text-red-400">*</span>
                   </label>
                   <div className="relative">
                     <input
                       type={showPassword ? "text" : "password"}
                       required
                       value={authPassword}
                       onChange={(e) => setAuthPassword(e.target.value)}
                       placeholder="Min. 6 characters"
                       className="w-full p-2.5 border rounded-xl dark:bg-zinc-800 focus:outline-none"
                     />
                     <button 
                       type="button" 
                       onClick={() => setShowPassword(!showPassword)}
                       className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600 font-normal text-[10px]"
                     >
                       {showPassword ? 'HIDE' : 'SHOW'}
                     </button>
                   </div>
                   {authMode === 'login' && (
                     <button 
                       type="button" 
                       onClick={() => { setAuthMode('forgot_password'); setAuthError(''); setAuthOtpSent(false); }} 
                       className="text-[10px] text-lavender-500 hover:text-lavender-600 mt-1 flex justify-end w-full"
                     >
                       Forgot Password?
                     </button>
                   )}
                 </div>
              )}

              {((authMode === 'register' && !authOtpSent) || (authMode === 'forgot_password' && authOtpSent)) && (
                 <div>
                   <label className="block text-zinc-400 mb-1">Confirm Password <span className="text-red-400">*</span></label>
                   <div className="relative">
                     <input
                       type={showPassword ? "text" : "password"}
                       required
                       value={authConfirmPassword}
                       onChange={(e) => setAuthConfirmPassword(e.target.value)}
                       placeholder="Match your password"
                       className="w-full p-2.5 border rounded-xl dark:bg-zinc-800 focus:outline-none"
                     />
                   </div>
                 </div>
              )}

              {authOtpSent && (authMode === 'register' || authMode === 'forgot_password') && (
                <div>
                  <label className="block text-zinc-400 mb-1">Enter Verification Code (OTP) <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={authOtp}
                    onChange={(e) => setAuthOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit code"
                    className="w-full p-2.5 border rounded-xl dark:bg-zinc-800 focus:outline-none text-center tracking-widest text-lg font-mono"
                    maxLength={6}
                  />
                  
                  <div className="flex justify-between items-center mt-2">
                     <p className="text-[10px] text-zinc-400 font-medium">OTP expires in 5:00</p>
                     <button 
                       type="button"
                       disabled={resendCooldown > 0 || isLoading}
                       onClick={handleSendOtp}
                       className="text-[10px] text-lavender-500 hover:text-lavender-600 disabled:text-zinc-300 disabled:hover:text-zinc-300 font-bold"
                     >
                       {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                     </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-full bg-lavender-400 hover:bg-lavender-500 text-white font-bold tracking-wide shadow-sm transition-colors mt-2 disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : (authMode === 'login' ? 'Secure Login' : (!authOtpSent ? 'Continue' : 'Verify & Complete'))}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* OVERLAY 2: DRIFT DETAIL DISCLOSURES VIEW */}
      {activeProduct && (
        <ProductDetailsModal
          product={activeProduct}
          isOpen={true}
          onClose={() => setActiveProduct(null)}
          onAddToCart={handleAddToCart}
          wishlist={wishlist}
          onToggleWishlist={handleToggleWishlist}
          user={user}
        />
      )}

    </div>
  );
}

// Subordinate container to safely retrieve orders on the fly directly inside App file
function OrderListContainer({ userId }: { userId: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (auth.currentUser) {
          const q = query(collection(db, 'orders'), where('firebaseUserId', '==', auth.currentUser.uid));
          const snapshot = await getDocs(q);
          const fbOrders: Order[] = [];
          snapshot.forEach(doc => fbOrders.push(doc.data() as Order));
          fbOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          
          if (fbOrders.length > 0) {
            setOrders(fbOrders);
            setLoading(false);
            return;
          }
        }
        
        // Fallback to local server API if Firebase brings back no orders or user is partially authenticated
        const res = await fetch('/api/orders', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('softdairies_token')}` }
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setOrders(data.filter((o: Order) => o.userId === userId));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [userId]);

  if (loading) return <p className="text-xs text-zinc-405 text-center">🧶 Finding restock histories...</p>;

  return orders.length === 0 ? (
    <p className="text-xs text-zinc-400 italic text-center py-6">You haven&apos;t placed any sales orders yet. Browse our lovely shop!</p>
  ) : (
    <div className="space-y-4">
      {orders.map((ord) => (
        <div key={ord.id} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border text-xs space-y-3">
          <div className="flex justify-between font-bold border-b pb-2">
            <div>
              <p className="text-lavender-600 dark:text-lavender-305 text-sm">CSD Order Record #{ord.id.substring(6)}</p>
              <p className="text-[10px] text-zinc-405 mt-0.5">Estimated Arrival Forecast: <span className="text-zinc-600 dark:text-zinc-200">{new Date(ord.estimatedDeliveryDate).toLocaleDateString()}</span></p>
            </div>
            <div className="text-right">
              <p className="text-sm font-serif">₹{ord.total}</p>
              <p className="text-[9px] text-[#22c55e] uppercase">Verified {ord.paymentMethod}</p>
            </div>
          </div>

          <div className="text-[11px] text-zinc-550 leading-relaxed font-semibold">
            {ord.items.map((i, idx) => (
              <p key={idx} className="flex justify-between">
                <span>{i.name} ({i.color}) x{i.quantity}</span>
                <span>₹{i.price * i.quantity}</span>
              </p>
            ))}
          </div>

          {/* MILSETONES RENDER TRACKING LINE */}
          <div className="space-y-2 pt-2 border-t">
            <p className="font-bold text-[9px] text-zinc-400 uppercase tracking-widest leading-none">ORDER COURIER MILESTONE STATUS:</p>
            
            <div className="flex justify-between text-[10px] items-center pt-2 relative">
              
              {/* Progress Line */}
              <div className="absolute top-4 left-[10%] right-[10%] h-1 bg-zinc-200 dark:bg-zinc-700 -z-0">
                <div className={`h-full bg-lavender-400 transition-all`} style={{
                  width: ord.shippingStatus === 'ordered' ? '0%'
                    : ord.shippingStatus === 'processing' ? '33%'
                    : ord.shippingStatus === 'shipped' ? '66%'
                    : '100%'
                }} />
              </div>

              {[
                { id: 'ordered', label: 'Ordered' },
                { id: 'processing', label: 'Stitching' },
                { id: 'shipped', label: 'Shipped' },
                { id: 'delivered', label: 'Delivered' }
              ].map((milestone) => {
                const stages = ['ordered', 'processing', 'shipped', 'delivered'];
                const oIndex = stages.indexOf(ord.shippingStatus);
                const mIndex = stages.indexOf(milestone.id);
                const isPassed = mIndex <= oIndex;

                return (
                  <div key={milestone.id} className="flex flex-col items-center z-10 shrink-0">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isPassed ? 'bg-lavender-400 text-white' : 'bg-white dark:bg-zinc-800 text-zinc-300 border border-zinc-200 dark:border-zinc-700'
                    }`}>
                      {isPassed ? '✓' : '•'}
                    </span>
                    <span className="text-[9px] font-bold text-zinc-450 mt-1">{milestone.label}</span>
                  </div>
                );
              })}
            </div>

            {ord.trackingNumber && (
              <p className="text-[10px] bg-white/70 dark:bg-zinc-900 p-2 rounded-lg font-mono text-zinc-400 mt-2 text-center">
                📪 Indian Post Tracking ID: <span className="font-bold text-zinc-700 dark:text-white">{ord.trackingNumber}</span>
              </p>
            )}
          </div>

        </div>
      ))}
    </div>
  );
}

// Subordinate container to retrieve custom creations
function CustomOrderListContainer({ userId }: { userId: string }) {
  const [customs, setCustoms] = useState<CustomOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/custom-orders', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('softdairies_token')}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCustoms(data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <p className="text-xs text-zinc-405 text-center">🧶 Gathering customized requests...</p>;

  return customs.length === 0 ? (
    <p className="text-xs text-zinc-400 italic text-center py-6">No bespoke stitching requests submitted yet. Use the customizable sheet!</p>
  ) : (
    <div className="space-y-4">
      {customs.map((req) => (
        <div key={req.id} className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border text-xs gap-3 flex flex-col sm:flex-row justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-1 px-3 bg-purple-105 text-purple-600 rounded-full text-[9px] font-bold uppercase tracking-wider">{req.itemType}</span>
              <span className={`p-1 px-3 rounded-full text-[9px] font-bold capitalize ${
                req.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'
              }`}>
                Quote status: {req.status}
              </span>
            </div>
            
            <p className="text-xs text-zinc-500 italic">“ {req.description} ”</p>
            <p className="text-[10px] text-zinc-400">Dimensions: {req.dimensions || "Standard"} • Colors Chosen: {req.colors}</p>
          </div>

          <div className="text-right self-end sm:self-center shrink-0">
            {req.status === 'approved' && req.priceEstimate ? (
              <div className="space-y-1">
                <span className="text-[9px] block text-zinc-450 uppercase font-bold tracking-wide">Approved Quote:</span>
                <span className="text-base font-bold text-lavender-500">₹{req.priceEstimate}</span>
                <span className="block text-[8px] italic text-zinc-400 leading-none">Adding as restock shortly</span>
              </div>
            ) : (
              <p className="text-[10px] text-zinc-400 italic">Quote being prepared...</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
