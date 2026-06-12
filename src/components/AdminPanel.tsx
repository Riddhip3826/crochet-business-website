import React, { useState, useEffect } from 'react';
import { Plus, Trash, Edit, RefreshCw, Landmark, ShoppingCart, UserCheck, Heart, Sparkles, MessageCircle, AlertCircle, ShoppingBag, FileText, CheckCircle, Eye } from 'lucide-react';
import { Product, Order, CustomOrder, Review, User, Category } from '../types';

interface AdminPanelProps {
  user: User | null;
}

export default function AdminPanel({ user }: AdminPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'products' | 'orders' | 'custom-requests' | 'reviews'>('overview');
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customRequests, setCustomRequests] = useState<CustomOrder[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Add Product Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('keychains');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdOriginalPrice, setNewProdOriginalPrice] = useState('');
  const [newProdStock, setNewProdStock] = useState('10');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImage, setNewProdImage] = useState('');
  const [newProdColors, setNewProdColors] = useState('Lavender Pastel, Sunset Pink');
  const [newProdSize, setNewProdSize] = useState('8cm x 8cm');
  const [newProdDetails, setNewProdDetails] = useState('100% Cotton, Hypoallergenic stuffing');
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');

  // Estimate Quote Form state (for Custom Orders)
  const [activeQuoteId, setActiveQuoteId] = useState<string | null>(null);
  const [quotePrice, setQuotePrice] = useState('');

  // Fetch admin analytical facts
  const refreshData = () => {
    if (!user) return;
    setLoading(true);
    
    // 1. Fetch Analytics Overview
    fetch('/api/admin/analytics', {
      headers: { 'x-user-id': user.id }
    })
      .then(res => res.json())
      .then(data => {
        setAnalytics(data);
        setCustomRequests(data.customRequests || []);
      })
      .catch(err => console.error("Failed to load admin analytics:", err));

    // 2. Fetch all products
    fetch('/api/products')
      .then(res => res.json())
      .then(setProducts)
      .catch(err => console.error(err));

    // 3. Fetch all orders
    fetch('/api/admin/orders', {
      headers: { 'x-user-id': user.id }
    })
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    refreshData();
  }, [user]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto my-20 p-6 text-center rounded-3xl bg-red-50 dark:bg-red-950/20 border border-red-100 text-red-500 font-serif">
        <AlertCircle className="w-10 h-10 mx-auto mb-3" />
        <h2 className="font-bold text-lg mb-1">Restricted Access</h2>
        <p className="text-xs text-zinc-500 leading-normal">
          You must log in to the administrator portal to view custom analytics. Please sign in as Riddhip3826@gmail.com.
        </p>
      </div>
    );
  }

  // Handle adding product
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!newProdName || !newProdPrice || !newProdCategory) {
      setFormError("Product name, price, and category are mandated.");
      return;
    }

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({
          name: newProdName,
          category: newProdCategory,
          price: Number(newProdPrice),
          originalPrice: newProdOriginalPrice ? Number(newProdOriginalPrice) : undefined,
          stock: Number(newProdStock),
          description: newProdDesc,
          images: newProdImage ? [newProdImage] : undefined,
          colors: newProdColors.split(',').map(c => c.trim()),
          size: newProdSize,
          details: newProdDetails.split(',').map(d => d.trim()),
          isFeatured: true,
          isBestSeller: false
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Failed to save product");
      } else {
        setFormSuccess("✨ Whimsical product catalog item added successfully!");
        setProducts(prev => [data, ...prev]);
        setShowAddForm(false);
        // Clear inputs
        setNewProdName('');
        setNewProdPrice('');
        setNewProdOriginalPrice('');
        setNewProdStock('10');
        setNewProdDesc('');
        setNewProdImage('');
        refreshData();
      }
    } catch {
      setFormError("Server synchronization error.");
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this handmade design?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': user.id }
      });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== id));
        refreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update order delivery stages
  const handleUpdateDelivery = async (orderId: string, status: string, trackingNum?: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({
          shippingStatus: status,
          ...(trackingNum && { trackingNumber: trackingNum })
        })
      });

      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, shippingStatus: status as any, ...(trackingNum && { trackingNumber: trackingNum }) } : o));
        refreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Pricing / Quote of custom requests
  const handleQuoteSubmit = async (customId: string) => {
    if (!quotePrice) return;
    try {
      const res = await fetch(`/api/custom-orders/${customId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({
          priceEstimate: Number(quotePrice),
          status: 'approved'
        })
      });

      if (res.ok) {
        setCustomRequests(prev => prev.map(co => co.id === customId ? { ...co, priceEstimate: Number(quotePrice), status: 'approved' } : co));
        setActiveQuoteId(null);
        setQuotePrice('');
        refreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCustomReject = async (customId: string) => {
    try {
      const res = await fetch(`/api/custom-orders/${customId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({ status: 'rejected' })
      });
      if (res.ok) {
        setCustomRequests(prev => prev.map(co => co.id === customId ? { ...co, status: 'rejected' } : co));
        refreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* Admin Title Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
            💻 Admin Control Cabin <span className="text-xs bg-lavender-100 text-lavender-600 dark:bg-zinc-800 dark:text-lavender-305 px-3 py-1 rounded-full font-sans">Active Session</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Analyze sales performance, add whimsical designs, track shipping progress, and quote custom orders.
          </p>
        </div>
        <button
          onClick={refreshData}
          className="px-4 py-2 text-xs font-bold rounded-full border border-lavender-200 hover:bg-lavender-50 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-white flex items-center gap-1.5 transition-colors self-end"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Reload Data
        </button>
      </div>

      {/* Analytics widgets Summary Cards */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          <div className="p-4 rounded-3xl bg-white dark:bg-zinc-800 border border-lavender-100 dark:border-zinc-750 flex items-center gap-3">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl text-emerald-500">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-zinc-400">Total Revenue</span>
              <p className="text-xl font-bold font-serif text-zinc-700 dark:text-white">₹{analytics.summary.totalSales}</p>
            </div>
          </div>

          <div className="p-4 rounded-3xl bg-white dark:bg-zinc-800 border border-lavender-100 dark:border-zinc-750 flex items-center gap-3">
            <div className="p-3 bg-lavender-50 dark:bg-lavender-950/20 rounded-2xl text-lavender-500">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-zinc-400">Total Orders</span>
              <p className="text-xl font-bold font-serif text-zinc-700 dark:text-white">{analytics.summary.ordersCount}</p>
            </div>
          </div>

          <div className="p-4 rounded-3xl bg-white dark:bg-zinc-800 border border-lavender-100 dark:border-zinc-750 flex items-center gap-3">
            <div className="p-3 bg-pink-50 dark:bg-pink-950/20 rounded-2xl text-pink-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-zinc-400">Custom Order Requests</span>
              <p className="text-xl font-bold font-serif text-zinc-700 dark:text-white">{analytics.summary.customCount}</p>
            </div>
          </div>

          <div className="p-4 rounded-3xl bg-white dark:bg-zinc-800 border border-lavender-100 dark:border-zinc-750 flex items-center gap-3">
            <div className="p-3 bg-sky-50 dark:bg-sky-950/20 rounded-2xl text-sky-400">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-zinc-400">Active Customers</span>
              <p className="text-xl font-bold font-serif text-zinc-700 dark:text-white">{analytics.summary.usersCount}</p>
            </div>
          </div>

        </div>
      )}

      {/* Admin Subtabs navigation */}
      <div className="flex border-b border-lavender-150 dark:border-zinc-850 gap-4 overflow-x-auto pb-px mb-8 scrollbar-none">
        {[
          { id: 'overview', label: 'Summary', icon: Sparkles },
          { id: 'products', label: 'Products Master', icon: ShoppingBag },
          { id: 'orders', label: 'Order Deliveries', icon: ShoppingCart },
          { id: 'custom-requests', label: 'Bespoke Quote Custom Requests', icon: FileText },
        ].map((subTab) => {
          const Icon = subTab.icon;
          const isSelected = activeSubTab === subTab.id;
          return (
            <button
              key={subTab.id}
              onClick={() => setActiveSubTab(subTab.id as any)}
              className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
                isSelected
                  ? 'border-lavender-400 text-lavender-600 dark:text-lavender-300'
                  : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {subTab.label}
            </button>
          );
        })}
      </div>

      {/* SUBTAB 1: OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Recent Orders Overview */}
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-lavender-100 dark:border-zinc-800 shadow-xs">
              <h3 className="font-serif text-lg font-bold text-zinc-800 dark:text-white mb-4">
                Recent Store Sales (UPI / Card orders)
              </h3>
              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2">
                {orders.length === 0 ? (
                  <p className="text-xs text-zinc-400 italic text-center py-10">No orders placed recently.</p>
                ) : (
                  orders.slice(0, 5).map((ord) => (
                    <div key={ord.id} className="p-3 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800 font-medium text-xs flex justify-between items-center border">
                      <div>
                        <p className="font-bold text-zinc-800 dark:text-zinc-150">Order #{ord.id.substring(6)}</p>
                        <p className="text-[10px] text-zinc-400">{ord.userName} • {ord.items.length} items</p>
                        <p className="text-[9px] text-zinc-300">{new Date(ord.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lavender-500">₹{ord.total}</p>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold mt-1 ${
                          ord.shippingStatus === 'delivered' ? 'bg-emerald-50 text-emerald-600' : 'bg-lavender-50 text-lavender-500'
                        }`}>
                          {ord.shippingStatus}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Custom request quotes Overview */}
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-lavender-100 dark:border-zinc-800 shadow-xs">
              <h3 className="font-serif text-lg font-bold text-zinc-800 dark:text-white mb-4">
                Bespoke Order Inbox (Insta/Pinterest styling)
              </h3>
              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2">
                {customRequests.length === 0 ? (
                  <p className="text-xs text-zinc-400 italic text-center py-10">No custom orders found.</p>
                ) : (
                  customRequests.slice(0, 5).map((co) => (
                    <div key={co.id} className="p-3 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800 font-medium text-xs flex justify-between items-start border">
                      <div>
                        <p className="font-bold text-zinc-800 dark:text-zinc-150">{co.itemType}</p>
                        <p className="text-[10px] text-zinc-400">By: {co.name} • Email: {co.email}</p>
                        <p className="text-[10px] text-zinc-500 mt-1 italic">“{co.description}”</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          co.status === 'pending' ? 'bg-amber-100 text-amber-700' : co.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-500'
                        }`}>
                          {co.status}
                        </span>
                        {co.priceEstimate && <p className="text-[10px] font-extrabold mt-1">Est: ₹{co.priceEstimate}</p>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SUBTAB 2: PRODUCTS MASTER (CRUD) */}
      {activeSubTab === 'products' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-zinc-800 dark:text-white"> Handmade Product Inventory ({products.length})</h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 rounded-full bg-lavender-400 hover:bg-lavender-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Craft Crochet
            </button>
          </div>

          {/* Add product drawer */}
          {showAddForm && (
            <div className="p-6 bg-white dark:bg-zinc-850 rounded-3xl border border-lavender-100 dark:border-zinc-750 animate-zoom-in space-y-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <h4 className="font-serif font-bold text-base text-zinc-800 dark:text-white">❀ New Stitch Design Setup</h4>
                <button onClick={() => setShowAddForm(false)} className="text-zinc-400 hover:text-red-500 text-xs font-bold uppercase tracking-wide">Back</button>
              </div>

              {formError && <p className="text-xs text-red-500 bg-red-50 p-2.5 rounded-xl font-medium">{formError}</p>}
              {formSuccess && <p className="text-xs text-green-600 bg-green-50 p-2.5 rounded-xl font-semibold">{formSuccess}</p>}

              <form onSubmit={handleAddProductSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-zinc-500 mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    placeholder="e.g., Pink Daisy Rose Bouquet"
                    className="w-full p-2.5 rounded-xl border border-lavender-200 dark:bg-zinc-800 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-500 mb-1">Product Category</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-lavender-200 dark:bg-zinc-800 dark:text-white focus:outline-none"
                  >
                    <option value="keychains">Crochet Keychains</option>
                    <option value="flowers">Crochet Flowers</option>
                    <option value="hair-accessories">Hair Accessories</option>
                    <option value="bouquets">Crochet Bouquets</option>
                    <option value="pots">Crochet Pots</option>
                    <option value="gifts">Handmade Gifts</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-500 mb-1">Selling Price (INR)</label>
                  <input
                    type="number"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    placeholder="e.g., 549"
                    className="w-full p-2.5 rounded-xl border border-lavender-200 dark:bg-zinc-800 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-500 mb-1">Original Price (Strikeout/Optional)</label>
                  <input
                    type="number"
                    value={newProdOriginalPrice}
                    onChange={(e) => setNewProdOriginalPrice(e.target.value)}
                    placeholder="e.g., 699"
                    className="w-full p-2.5 rounded-xl border border-lavender-200 dark:bg-zinc-800 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-500 mb-1">Inventory Stock level</label>
                  <input
                    type="number"
                    required
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(e.target.value)}
                    placeholder="10"
                    className="w-full p-2.5 rounded-xl border border-lavender-200 dark:bg-zinc-800 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-500 mb-1">Product Size Coordinates</label>
                  <input
                    type="text"
                    value={newProdSize}
                    onChange={(e) => setNewProdSize(e.target.value)}
                    placeholder="15cm height"
                    className="w-full p-2.5 rounded-xl border border-lavender-200 dark:bg-zinc-800 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block font-bold text-zinc-500 mb-1">Image URL</label>
                  <input
                    type="text"
                    value={newProdImage}
                    onChange={(e) => setNewProdImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full p-2.5 rounded-xl border border-lavender-200 dark:bg-zinc-800 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block font-bold text-zinc-500 mb-1">Product Description</label>
                  <textarea
                    rows={3}
                    value={newProdDesc}
                    onChange={(e) => setNewProdDesc(e.target.value)}
                    placeholder="Describe wool yarn characteristics or feelings..."
                    className="w-full p-2.5 rounded-xl border border-lavender-200 dark:bg-zinc-800 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="md:col-span-3">
                  <button
                    type="submit"
                    className="w-full py-3 bg-lavender-400 hover:bg-lavender-500 text-white font-bold rounded-xl transition-all"
                  >
                    Stitch & Add to Shop Catalog 🌸
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Catalog grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((prod) => (
              <div key={prod.id} className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-lavender-100 dark:border-zinc-800 flex justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={prod.images[0]}
                    alt={prod.name}
                    className="w-16 h-16 rounded-xl object-cover border"
                  />
                  <div className="font-medium text-xs">
                    <p className="font-serif font-bold text-sm text-zinc-800 dark:text-zinc-100">{prod.name}</p>
                    <p className="text-zinc-400 capitalize">{prod.category} • Size: {prod.size || "Standard"}</p>
                    <p className="text-lavender-500 font-bold mt-1">₹{prod.price} <span className="text-[10px] text-zinc-400 font-normal">({prod.stock} pieces left)</span></p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteProduct(prod.id)}
                  className="p-2 rounded-full hover:bg-red-50 text-red-500 transition-colors shrink-0"
                  title="Remove item"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* SUBTAB 3: ORDER MILESTONES */}
      {activeSubTab === 'orders' && (
        <div className="space-y-6">
          <h3 className="text-base font-bold text-zinc-800 dark:text-white mb-4">Customer Orders & Deliveries</h3>

          <div className="space-y-4">
            {orders.length === 0 ? (
              <p className="text-center py-20 text-zinc-400 font-serif italic text-sm">No sales matched today. We are always preparing!</p>
            ) : (
              orders.map((ord) => (
                <div key={ord.id} className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-lavender-105 dark:border-zinc-800 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-lavender-50 pb-3 text-xs">
                    <div>
                      <p className="font-bold text-sm text-[#7b29ff]">Order #{ord.id}</p>
                      <p className="text-zinc-400">Placed: {new Date(ord.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="p-1 px-3 bg-green-100 text-green-700 font-bold rounded-full capitalize">
                        Payment: {ord.paymentStatus} via {ord.paymentId ? `RZP (${ord.paymentId})` : 'UPI'}
                      </span>
                      <span className="p-1 px-3 bg-lavender-50 text-lavender-600 dark:bg-zinc-800 dark:text-lavender-305 font-bold rounded-full uppercase">
                        {ord.shippingStatus}
                      </span>
                    </div>
                  </div>

                  {/* Items content list */}
                  <div className="text-xs space-y-2">
                    <p className="font-bold text-zinc-500 uppercase tracking-widest text-[10px]">ITEMS TO PREPARE:</p>
                    {ord.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between font-medium">
                        <span>{item.name} x {item.quantity} ({item.color})</span>
                        <span className="text-zinc-550">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                    <div className="flex justify-between border-t border-dashed pt-2 font-bold text-sm text-lavender-500">
                      <span>Total Invoice</span>
                      <span>₹{ord.total}</span>
                    </div>
                  </div>

                  {/* Ship fields */}
                  <div className="text-xs p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-850 border grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="font-bold text-zinc-400 uppercase tracking-wider text-[9px] mb-1">Buyer Details</p>
                      <p className="font-semibold text-zinc-700 dark:text-zinc-200">{ord.userName}</p>
                      <p className="text-zinc-500 font-mono text-[10px] mt-0.5">{ord.userEmail}</p>
                      <p className="text-zinc-500 mt-1">Phone: {ord.phone}</p>
                    </div>
                    <div>
                      <p className="font-bold text-zinc-400 uppercase tracking-wider text-[9px] mb-1">Shipping Address</p>
                      <p className="text-zinc-500 leading-normal">{ord.address}</p>
                      {ord.notes && <p className="text-[10px] text-pink-400 italic mt-1 font-semibold">Notes: &quot;{ord.notes}&quot;</p>}
                    </div>

                    {/* Milestone adjustment */}
                    <div className="space-y-2">
                      <p className="font-bold text-zinc-400 uppercase tracking-wider text-[9px]">Adjust Delivery Status</p>
                      
                      <select
                        value={ord.shippingStatus}
                        onChange={(e) => handleUpdateDelivery(ord.id, e.target.value, ord.trackingNumber)}
                        className="w-full p-2 rounded-lg border text-xs bg-white dark:bg-zinc-800 dark:text-white"
                      >
                        <option value="ordered">Ordered (Awaiting stitching)</option>
                        <option value="processing">Processing (Vase fitting/packing)</option>
                        <option value="shipped">Shipped (Awaiting tracking)</option>
                        <option value="delivered">Delivered ❀</option>
                      </select>

                      <input
                        type="text"
                        placeholder="Tracking Number (e.g. CSD-123)"
                        value={ord.trackingNumber || ''}
                        onChange={(e) => handleUpdateDelivery(ord.id, ord.shippingStatus, e.target.value)}
                        className="w-full p-2 border rounded-lg text-xs dark:bg-zinc-850 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 4: BESPOKE QUOTE CUSTOM REQUESTS */}
      {activeSubTab === 'custom-requests' && (
        <div className="space-y-6">
          <h3 className="text-base font-bold text-zinc-800 dark:text-white mb-4">Personalized Custom Order Requests</h3>

          <div className="space-y-4">
            {customRequests.length === 0 ? (
              <p className="text-center py-20 text-zinc-400 font-serif italic text-sm">No custom orders requested yet.</p>
            ) : (
              customRequests.map((req) => (
                <div key={req.id} className="p-6 bg-white dark:bg-zinc-900 border border-lavender-100 rounded-3xl flex flex-col md:flex-row justify-between gap-6">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="p-1 px-3 bg-purple-100 text-purple-600 rounded-full text-[10px] font-bold uppercase tracking-wider">{req.itemType}</span>
                      <span className={`p-1 px-3.5 rounded-full text-[9px] font-bold capitalize ${
                        req.status === 'pending' ? 'bg-amber-100 text-amber-700' : req.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    <h4 className="font-serif font-bold text-base text-zinc-800 dark:text-white">{req.itemType} (Qty: {req.quantity})</h4>
                    <p className="text-xs text-zinc-550 italic bg-zinc-50 dark:bg-zinc-805 p-3 rounded-xl">“ {req.description} ”</p>
                    
                    <div className="text-xs grid grid-cols-2 gap-4 text-zinc-500 font-medium">
                      <div>Dimensions: <span className="text-zinc-800 dark:text-zinc-205">{req.dimensions || 'Standard'}</span></div>
                      <div>Colors Schema: <span className="text-zinc-800 dark:text-zinc-205">{req.colors}</span></div>
                      <div>Customer Profile: <span className="text-zinc-800 dark:text-zinc-205">{req.name} {req.email}</span></div>
                      <div>Created At: <span className="text-zinc-800 dark:text-zinc-205">{new Date(req.createdAt).toLocaleDateString()}</span></div>
                    </div>
                  </div>

                  {/* Custom order pricing trigger forms */}
                  <div className="flex flex-col justify-between items-end border-l pl-6 border-zinc-100 shrink-0 text-xs gap-4">
                    {req.referenceImageUrl && (
                      <div className="text-right">
                        <p className="text-[9px] font-bold uppercase text-zinc-400 mb-1">Reference Design File:</p>
                        <a href={req.referenceImageUrl} target="_blank" rel="noreferrer" className="inline-block p-1 bg-lavender-50 text-lavender-600 rounded-lg hover:underline font-semibold leading-none">View Sketch image</a>
                      </div>
                    )}

                    {req.status === 'pending' ? (
                      <div className="space-y-2 w-full max-w-[200px]">
                        {activeQuoteId === req.id ? (
                          <div className="space-y-1.5 animate-slide-up">
                            <label className="block text-[9px] text-zinc-400 font-bold uppercase">Enter Quote Price (INR)</label>
                            <input
                              type="number"
                              value={quotePrice}
                              onChange={(e) => setQuotePrice(e.target.value)}
                              placeholder="e.g., 600"
                              className="w-full p-2 border rounded-lg text-xs dark:bg-zinc-800 focus:outline-none"
                            />
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleQuoteSubmit(req.id)}
                                className="flex-1 py-1 px-2 text-[10px] font-bold rounded-lg bg-green-500 text-white"
                              >
                                Send Quote
                              </button>
                              <button
                                onClick={() => setActiveQuoteId(null)}
                                className="py-1 px-2 text-[10px] font-bold rounded-lg bg-zinc-100 hover:bg-zinc-250 text-zinc-650"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setActiveQuoteId(req.id);
                                setQuotePrice('');
                              }}
                              className="flex-1 py-2 px-4 rounded-full bg-lavender-400 text-white font-bold text-xs"
                            >
                              Quote & Approve
                            </button>
                            <button
                              onClick={() => handleCustomReject(req.id)}
                              className="py-2 px-4 rounded-full bg-red-105 border border-red-200 text-red-500 text-xs font-bold"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-right">
                        <p className="text-[10px] text-zinc-400 font-bold">Estimated Quote Price:</p>
                        <p className="text-lg font-bold text-lavender-600">₹{req.priceEstimate || 'Pending'}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
}
