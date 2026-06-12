import { useState } from 'react';
import { ShoppingBag, Heart, User, Sun, Moon, Menu, X, Sparkles, HelpCircle, Image, FileText, Info, PhoneCall } from 'lucide-react';
import { User as UserType } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cartCount: number;
  wishlistCount: number;
  user: UserType | null;
  onLogout: () => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  onOpenAuth: () => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  cartCount,
  wishlistCount,
  user,
  onLogout,
  darkMode,
  setDarkMode,
  onOpenAuth,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Sparkles },
    { id: 'shop', label: 'Shop', icon: ShoppingBag },
    { id: 'gallery', label: 'Gallery', icon: Image },
    { id: 'custom-order', label: 'Custom Orders', icon: FileText },
    { id: 'about', label: 'About', icon: Info },
    { id: 'contact', label: 'Contact', icon: PhoneCall },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 glass-nav transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <div className="flex items-center cursor-pointer gap-2 sm:gap-3 shrink min-w-0" onClick={() => handleNavClick('home')}>
            <img src="logo.jpeg" alt="Logo" className="h-9 sm:h-12 w-auto object-contain shrink-0" />
            <span className="font-serif text-lg sm:text-2xl font-bold tracking-tight text-lavender-500 hover:text-lavender-600 transition-colors hidden lg:block whitespace-nowrap">
              @crochet.softdiaries
            </span>
            <span className="font-serif text-[1.1rem] sm:text-2xl font-bold tracking-tight text-lavender-500 hover:text-lavender-600 transition-colors lg:hidden truncate">
              softdiaries
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex space-x-1 xl:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  id={`nav-item-${item.id}`}
                  className={`px-2 py-2 xl:px-3 text-sm font-medium transition-all duration-200 flex items-center gap-1.5 rounded-full ${
                    isActive
                      ? 'bg-lavender-100 text-lavender-600 dark:bg-lavender-900/40 dark:text-lavender-300'
                      : 'text-zinc-600 dark:text-zinc-300 hover:bg-lavender-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Icon className="w-4 h-4 hidden xl:block" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-1 sm:space-x-3 shrink-0">
            
            {/* Dark Mode Toggle */}
            <button
              id="theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full text-zinc-500 hover:bg-lavender-50 dark:hover:bg-zinc-800 dark:text-zinc-300 transition-colors"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-zinc-600" />}
            </button>

            {/* Wishlist Icon */}
            <button
              id="wishlist-tab-btn"
              onClick={() => handleNavClick('wishlist')}
              className="p-2 rounded-full text-zinc-500 hover:bg-lavender-50 dark:hover:bg-zinc-800 dark:text-zinc-300 relative transition-colors"
              title="My Wishlist"
            >
              <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'fill-pink-400 text-pink-400' : ''}`} />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-pink-400 rounded-full">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Icon */}
            <button
              id="cart-tab-btn"
              onClick={() => handleNavClick('cart')}
              className="p-2 rounded-full text-zinc-500 hover:bg-lavender-50 dark:hover:bg-zinc-800 dark:text-zinc-300 relative transition-colors"
              title="My Bag"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-lavender-400 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Dropdown / Login */}
            <div className="relative">
              {user ? (
                <div>
                  <button
                    id="profile-dropdown-toggle"
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-1.5 p-1.5 rounded-full hover:bg-lavender-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors"
                  >
                    <img
                      src={user.avatarUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80"}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover border border-lavender-200"
                    />
                    <span className="hidden sm:inline text-xs font-semibold max-w-[80px] truncate">{user.name}</span>
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-zinc-800 shadow-lg border border-lavender-100 dark:border-zinc-700 py-1.5 z-50 animate-fade-in">
                      <div className="px-4 py-2 border-b border-lavender-50 dark:border-zinc-700 bg-lavender-50/30 dark:bg-zinc-800/50">
                        <p className="text-xs text-zinc-400">Signed in as</p>
                        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 truncate">{user.name}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-lavender-100 text-lavender-600 dark:bg-zinc-700 dark:text-lavender-300 capitalize">
                          {user.role} role
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          handleNavClick('profile');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-zinc-600 dark:text-zinc-200 hover:bg-lavender-50 dark:hover:bg-zinc-700 transition-colors"
                      >
                        My Profile & Orders
                      </button>

                      {user.role === 'admin' && (
                        <button
                          onClick={() => {
                            handleNavClick('admin');
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm font-semibold text-lavender-500 dark:text-lavender-400 hover:bg-lavender-50 dark:hover:bg-zinc-700 transition-colors"
                        >
                          💻 Admin Dashboard
                        </button>
                      )}

                      <button
                        onClick={() => {
                          onLogout();
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  id="auth-open-btn"
                  onClick={onOpenAuth}
                  className="px-4 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-sm font-semibold rounded-full bg-lavender-400 hover:bg-lavender-500 text-white shadow-sm transition-all duration-200"
                >
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile Menu Icon */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full lg:hidden text-zinc-500 hover:bg-lavender-50 dark:hover:bg-zinc-800 dark:text-zinc-300 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-lavender-100 dark:border-zinc-800 bg-cream-soft dark:bg-zinc-900 py-3 px-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-lavender-100 text-lavender-600 dark:bg-lavender-900/40 dark:text-lavender-300'
                    : 'text-zinc-600 dark:text-zinc-300 hover:bg-lavender-50 dark:hover:bg-zinc-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
}
