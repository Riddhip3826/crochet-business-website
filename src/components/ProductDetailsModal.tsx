import React, { useState, useEffect } from 'react';
import { X, Heart, ShoppingBag, Star, Calendar, MessageSquare, Plus, Minus, Check } from 'lucide-react';
import { Product, Review, User } from '../types';

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, color: string) => void;
  wishlist: Product[];
  onToggleWishlist: (productId: string) => void;
  user: User | null;
}

export default function ProductDetailsModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  wishlist,
  onToggleWishlist,
  user,
}: ProductDetailsModalProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loadingReviews, setLoadingReviews] = useState(false);
  
  // New review state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const isInWishlist = wishlist.some(p => p.id === product?.id);

  // Fetch reviews for specific product
  useEffect(() => {
    if (product && isOpen) {
      setLoadingReviews(true);
      setSelectedColor(product.colors[0] || 'Lavender Patel');
      setQuantity(1);
      setNewComment('');
      setNewRating(5);
      setSubmitSuccess(false);
      setSubmitError('');

      fetch(`/api/reviews/${product.id}`)
        .then(res => res.json())
        .then(data => {
          setReviews(data);
          setLoadingReviews(false);
        })
        .catch(err => {
          console.error("Failed to load reviews:", err);
          setLoadingReviews(false);
        });
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setSubmitError("Please sign in or create an account first to write a cozy review! 🌸");
      return;
    }
    if (!newComment.trim()) {
      setSubmitError("Please type a comment first.");
      return;
    }

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({
          productId: product.id,
          rating: newRating,
          comment: newComment
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || "Failed to post review");
      } else {
        setReviews(prev => [data, ...prev]);
        setNewComment('');
        setNewRating(5);
        setSubmitSuccess(true);
        setSubmitError('');
        setTimeout(() => setSubmitSuccess(false), 4000);
      }
    } catch (err) {
      console.error(err);
      setSubmitError("Failed to communicate with our crochet studio server.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      
      {/* Backdrop */}
      <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative bg-cream-soft dark:bg-zinc-900 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-lavender-100 dark:border-zinc-800 animate-zoom-in">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/80 dark:bg-zinc-800/80 hover:bg-lavender-50 dark:hover:bg-zinc-700 text-zinc-500 transition-colors shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 sm:p-8">
          
          {/* Product Gallery */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-lavender-50 dark:bg-zinc-800 border border-lavender-100/60 dark:border-zinc-700 relative">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover select-none"
              />
              {product.isBestSeller && (
                <div className="absolute top-3 left-3 bg-pink-400 text-white font-serif italic text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                  Best Seller ✨
                </div>
              )}
            </div>
            
            {/* Craft details list */}
            <div className="p-4 rounded-2xl bg-white/70 dark:bg-zinc-800/50 border border-lavender-100/40 dark:border-zinc-750">
              <h4 className="text-xs font-bold text-lavender-500 dark:text-lavender-300 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <span>🧶</span> HANDMADE HIGHLIGHTS
              </h4>
              <ul className="space-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                {product.details && product.details.length > 0 ? (
                  product.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-pink-400">❀</span> {detail}
                    </li>
                  ))
                ) : (
                  <>
                    <li className="flex items-start gap-1.5"><span className="text-pink-400">❀</span> 100% handcrafted stitch-by-stitch</li>
                    <li className="flex items-start gap-1.5"><span className="text-pink-400">❀</span> Premium eco-friendly milk cotton wool yarn</li>
                    <li className="flex items-start gap-1.5"><span className="text-pink-400">❀</span> Perfect custom-packed gift set</li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* Product Specifications Content */}
          <div className="space-y-6">
            <div>
              <span className="inline-block px-3 py-1 text-[10px] font-extrabold tracking-widest text-[#a855f7] bg-purple-100 dark:bg-purple-900/30 rounded-full uppercase mb-2">
                {product.category}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-800 dark:text-zinc-100 leading-tight">
                {product.name}
              </h2>
              
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center text-amber-400">
                  <Star className="w-4.5 h-4.5 fill-current" />
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-350 ml-1 mt-0.5">{product.rating}</span>
                </div>
                <div className="text-zinc-300 dark:text-zinc-700">|</div>
                <span className="text-xs text-zinc-400 font-medium">({product.reviewsCount} verified reviews)</span>
              </div>
            </div>

            {/* Pricing Column */}
            <div className="flex items-baseline gap-2.5">
              <span className="text-3xl font-serif font-bold text-lavender-500">₹{product.price}</span>
              {product.originalPrice && (
                <span className="text-sm line-through text-zinc-400">₹{product.originalPrice}</span>
              )}
            </div>

            <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
              {product.description}
            </p>

            {/* Color Select */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">SELECT WOOL COLOUR:</span>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedColor(color)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      selectedColor === color
                        ? 'bg-lavender-400 text-white border-lavender-400'
                        : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-lavender-100 dark:border-zinc-700 hover:border-lavender-200'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Stock status */}
            <div className="text-xs">
              {product.stock > 0 ? (
                <span className="text-emerald-500 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                  🧶 Ready to Ship! {product.stock} pieces currently in stock
                </span>
              ) : (
                <span className="text-red-400 font-bold">⚠️ Sold Out! Taking pre-orders (stitching queue: 5 days)</span>
              )}
              {product.size && (
                <p className="text-zinc-400 mt-1 font-medium">Estimated Dimensions: {product.size}</p>
              )}
            </div>

            {/* Quantity and Actions */}
            {product.stock > 0 && (
              <div className="flex items-center gap-4 pt-2 border-t border-lavender-50 dark:border-zinc-800">
                <div className="flex items-center border border-lavender-200 dark:border-zinc-750 rounded-full px-3 py-1">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="p-1 text-zinc-500 hover:text-lavender-500"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3.5 py-0.5 text-sm font-bold text-zinc-700 dark:text-white select-none">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="p-1 text-zinc-500 hover:text-lavender-500"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  id="add-to-cart-modal-btn"
                  onClick={() => {
                    onAddToCart(product, quantity, selectedColor);
                    onClose();
                  }}
                  className="flex-grow py-3 rounded-full bg-lavender-400 hover:bg-lavender-500 hover:shadow-lg text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <ShoppingBag className="w-4.5 h-4.5" />
                  Add to Bag • ₹{product.price * quantity}
                </button>

                <button
                  onClick={() => onToggleWishlist(product.id)}
                  className={`p-3 rounded-full border transition-colors ${
                    isInWishlist
                      ? 'bg-pink-50 border-pink-100 text-pink-400 dark:bg-pink-950/20 dark:border-pink-900'
                      : 'border-lavender-200 text-zinc-400 hover:text-pink-400 dark:border-zinc-700'
                  }`}
                  title="Save to Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-pink-400' : ''}`} />
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Reviews Section inside Modal */}
        <div className="p-6 sm:p-8 bg-zinc-50/70 dark:bg-zinc-950/40 border-t border-lavender-100 dark:border-zinc-800">
          <h3 className="font-serif text-xl font-bold text-zinc-800 dark:text-zinc-100 mb-6 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-lavender-400" />
            Verified Buyer Reviews ({reviews.length})
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Reviews list */}
            <div className="lg:col-span-2 space-y-4 max-h-[300px] overflow-y-auto pr-2">
              {loadingReviews ? (
                <div className="text-center py-6 text-zinc-400 text-xs">
                  🧶 Fetching verified customer feedback...
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-8 text-zinc-400 text-xs border border-dashed border-lavender-200 rounded-2xl bg-white dark:bg-zinc-850">
                  No verified reviews yet. Purchase this soft item and be the very first to leave a warm review! ❀
                </div>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-white dark:bg-zinc-800/80 border border-lavender-100/50 dark:border-zinc-750 shadow-xs">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={rev.userAvatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(rev.userName)}`}
                          alt={rev.userName}
                          className="w-6 h-6 rounded-full object-cover border"
                        />
                        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200">{rev.userName}</span>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed italic pr-2">
                      “ {rev.comment} ”
                    </p>
                    <span className="block text-[9px] text-zinc-300 mt-2 text-right">
                      Posted on {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Write a cozy review */}
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-lavender-100 dark:border-zinc-750 shadow-xs self-start">
              <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-widest mb-3">
                WRITE A COZY REVIEW
              </h4>
              <form onSubmit={handleAddReview} className="space-y-3">
                
                {/* Rating selection stars */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-zinc-400">Rating:</span>
                  <div className="flex gap-1 text-amber-300">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="hover:scale-110 active:scale-95 transition-all text-amber-400"
                      >
                        <Star className={`w-5.5 h-5.5 ${newRating >= star ? 'fill-current' : 'text-zinc-200'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment box */}
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share how this crochet piece makes you feel... 🧸"
                  rows={3}
                  className="w-full text-xs p-3 rounded-xl border border-lavender-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-lavender-300"
                />

                {submitError && (
                  <p className="text-[10px] text-red-500 leading-normal bg-red-50 dark:bg-red-950/20 p-2 rounded-lg font-medium">
                    ⚠️ {submitError}
                  </p>
                )}

                {submitSuccess && (
                  <p className="text-[10px] text-green-600 dark:text-green-400 leading-normal bg-green-50 p-2 rounded-lg font-medium">
                    ✨ Thank you! Your verified review is live in our store.
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-2 rounded-full bg-lavender-100 hover:bg-lavender-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-lavender-600 dark:text-lavender-300 text-xs font-bold transition-all"
                >
                  Submit verified review
                </button>
              </form>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
