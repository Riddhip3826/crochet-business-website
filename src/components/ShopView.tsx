import { useState, useEffect } from 'react';
import { Search, Heart, ShoppingBag, Star, RefreshCw, SlidersHorizontal } from 'lucide-react';
import { Product, Category, User } from '../types';

interface ShopViewProps {
  user: User | null;
  onAddToCart: (product: Product, quantity: number, color: string) => void;
  wishlist: Product[];
  onToggleWishlist: (productId: string) => void;
  onViewProduct: (product: Product) => void;
}

export default function ShopView({
  user,
  onAddToCart,
  wishlist,
  onToggleWishlist,
  onViewProduct,
}: ShopViewProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [allProductsCopy, setAllProductsCopy] = useState<Product[]>([]);

  // Filtering sub-states
  const [sortBy, setSortBy] = useState<'popular' | 'price-low' | 'price-high'>('popular');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch products and categories
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(setCategories)
      .catch(err => console.error("Failed to load categories:", err));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeCategory !== 'all') {
      params.append('category', activeCategory);
    }
    if (searchQuery) {
      params.append('search', searchQuery);
    }

    fetch(`/api/products?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setAllProductsCopy(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load products:", err);
        setLoading(false);
      });
  }, [activeCategory, searchQuery]);

  // Order sorting state
  useEffect(() => {
    let sorted = [...allProductsCopy];
    if (sortBy === 'price-low') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'popular') {
      sorted.sort((a, b) => b.rating - a.rating);
    }
    setProducts(sorted);
  }, [sortBy, allProductsCopy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* Header and Storytelling */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-zinc-800 dark:text-zinc-100 mb-2">
          🌸 Whimsical Crochet Restocked 🌸
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Handcrafted stitch-by-stitch with eco-friendly premium milk cotton. Perfect gifts to spark creative smiles.
        </p>
      </div>

      {/* Searching and Categorizing Controls Row */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch justify-between mb-8">
        
        {/* Search Input */}
        <div className="relative flex-grow max-w-lg">
          <input
            id="product-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cozy octopus keychains, bouquets, hairclips..."
            className="w-full text-sm pl-10 pr-4 py-2.5 rounded-full border border-lavender-200 bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-lavender-200"
          />
          <Search className="absolute left-3.5 top-3 w-4.5 h-4.5 text-zinc-400 shrink-0" />
        </div>

        {/* Sort and Filters */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2.5 rounded-full border border-lavender-150 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-300 flex items-center gap-2 hover:bg-lavender-50 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters & Sort
          </button>
          
          <div className="text-xs text-zinc-400 font-medium">
            Showing {products.length} design styles
          </div>
        </div>

      </div>

      {/* Expanded Filters drawer */}
      {showFilters && (
        <div className="p-4 mb-6 rounded-[24px] soft-card flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between animate-fade-in shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">Sort Products By</span>
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('popular')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${sortBy === 'popular' ? 'bg-lavender-400 text-white' : 'bg-zinc-50 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100'}`}
              >
                Top Reviews ⭐
              </button>
              <button
                onClick={() => setSortBy('price-low')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${sortBy === 'price-low' ? 'bg-lavender-400 text-white' : 'bg-zinc-50 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100'}`}
              >
                Price: Low to High 💸
              </button>
              <button
                onClick={() => setSortBy('price-high')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${sortBy === 'price-high' ? 'bg-lavender-400 text-white' : 'bg-zinc-50 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100'}`}
              >
                Price: High to Low 📈
              </button>
            </div>
          </div>
          
          <button
            onClick={() => {
              setActiveCategory('all');
              setSearchQuery('');
              setSortBy('popular');
            }}
            className="text-xs text-lavender-500 hover:underline uppercase tracking-wide font-bold shrink-0 self-end"
          >
            Clear All Criteria
          </button>
        </div>
      )}

      {/* Category Navigation Bar */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-8 whitespace-nowrap scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.slug}
            id={`category-tab-${cat.slug}`}
            onClick={() => setActiveCategory(cat.slug)}
            className={`px-5 py-2.5 rounded-full text-xs font-bold font-serif tracking-wide transition-all ${
              activeCategory === cat.slug
                ? 'bg-lavender-400 text-white shadow-md shadow-lavender-200/40 relative scale-102 border-transparent'
                : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-305 border border-lavender-100/70 dark:border-zinc-700 hover:bg-lavender-50/50'
            }`}
          >
            ❀ {cat.name}
          </button>
        ))}
      </div>

      {/* Product Display Cards Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <RefreshCw className="w-8 h-8 text-lavender-400 animate-spin" />
          <p className="text-sm text-zinc-400 font-serif italic">Unwrapping cozy items...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 rounded-3xl bg-white dark:bg-zinc-800/20 border border-dashed border-lavender-150 p-6">
          <span className="text-3xl">🧶</span>
          <h3 className="font-serif text-lg font-bold text-zinc-700 dark:text-zinc-300 mt-2">
            No matching items found
          </h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto mb-4">
            Our woolly knitting needles are always spinning. Speak with Riddhi in chat or file a custom order request!
          </p>
          <button
            onClick={() => {
              setActiveCategory('all');
              setSearchQuery('');
            }}
            className="px-5 py-2 rounded-full bg-lavender-100 text-lavender-600 text-xs font-bold hover:bg-lavender-200 transition-colors"
          >
            Browse All Items
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((prod) => {
            const isSaved = wishlist.some(item => item.id === prod.id);
            return (
              <div
                key={prod.id}
                id={`product-card-${prod.id}`}
                className="group relative soft-card rounded-[32px] overflow-hidden p-3 flex flex-col justify-between hover:lavender-glow hover:translate-y-[-4px] transition-all duration-300 cursor-pointer"
                onClick={() => onViewProduct(prod)}
              >
                
                {/* Image Panel */}
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-50 dark:bg-zinc-900 shadow-inner shrink-0">
                  <img
                    src={prod.images[0]}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 select-none"
                    loading="lazy"
                  />
                  
                  {/* Floating triggers */}
                  <button
                    id={`wishlist-toggle-${prod.id}`}
                    onClick={(e) => {
                      e.stopPropagation(); // Stop opening details modal
                      onToggleWishlist(prod.id);
                    }}
                    className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/80 dark:bg-zinc-900/80 hover:bg-white text-zinc-400 hover:text-pink-400 shadow-sm transition-colors"
                  >
                    <Heart className={`w-4.5 h-4.5 ${isSaved ? 'fill-pink-400 text-pink-400' : ''}`} />
                  </button>

                  {prod.isBestSeller && (
                    <span className="absolute top-2.5 left-2.5 font-serif text-[9px] font-extrabold tracking-wider bg-pink-400 text-white px-2.5 py-0.5 rounded-full select-none shadow-xs uppercase">
                      Bestseller ✨
                    </span>
                  )}
                </div>

                {/* Info specifications */}
                <div className="pt-3 pb-1 flex-grow flex flex-col justify-between min-h-[110px]">
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <div className="flex items-center text-amber-400">
                        <Star className="w-3 h-3 fill-current" />
                      </div>
                      <span className="text-[10px] text-zinc-400 font-bold">{prod.rating} ({prod.reviewsCount})</span>
                    </div>

                    <h3 className="font-serif font-bold text-sm text-zinc-800 dark:text-zinc-100 group-hover:text-lavender-500 transition-colors line-clamp-1">
                      {prod.name}
                    </h3>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500 leading-normal line-clamp-2 mt-1 pr-1 font-medium">
                      {prod.description}
                    </p>
                  </div>

                  {/* Pricing and Cart add */}
                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-lavender-50 dark:border-zinc-750">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-serif font-bold text-lavender-500">₹{prod.price}</span>
                      {prod.originalPrice && (
                        <span className="text-[10px] line-through text-zinc-400">₹{prod.originalPrice}</span>
                      )}
                    </div>

                    <button
                      id={`quick-add-${prod.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Quick add with default color
                        onAddToCart(prod, 1, prod.colors[0] || 'Lavender Pastel');
                      }}
                      className="p-1 px-3.5 rounded-full bg-lavender-50 dark:bg-zinc-700 text-[10px] font-bold text-lavender-500 dark:text-lavender-300 hover:bg-lavender-400 hover:text-white dark:hover:bg-lavender-900/60 dark:hover:text-white transition-all flex items-center gap-1 shrink-0"
                    >
                      <ShoppingBag className="w-3 h-3 shrink-0" />
                      + Cozy
                    </button>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
