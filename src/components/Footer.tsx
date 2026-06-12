import React, { useState } from 'react';
import { Instagram, Phone, MapPin, Send, Mail, Heart, Sparkles } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
}

export default function Footer({ setActiveTab }: FooterProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-cream-soft dark:bg-zinc-950 border-t border-lavender-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors duration-200">
      
      {/* Newsletter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 border-b border-lavender-100 dark:border-zinc-800/60">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2">
            <h3 className="font-serif text-2xl sm:text-3xl text-zinc-800 dark:text-zinc-100 font-bold tracking-tight mb-2">
              Join the Cozy Crochet Newsletter 🌸
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Receive updates on product restocks, secret flash sales, and whimsical handcrafted design releases.
            </p>
          </div>
          <div>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your lovely email..."
                className="flex-grow px-4 py-2.5 rounded-full text-sm border border-lavender-200 bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-lavender-300"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-full bg-lavender-400 hover:bg-lavender-500 text-white flex items-center justify-center gap-1.5 transition-colors self-stretch text-sm font-semibold shadow-sm"
              >
                <Send className="w-4 h-4" />
                Subscribe
              </button>
            </form>
            {subscribed && (
              <p className="text-xs text-green-500 dark:text-green-400 font-medium mt-2 animate-fade-in flex items-center gap-1">
                ✨ Successfully subscribed! Welcom to our creative dairy list.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div>
            <h4 className="font-serif text-xl font-bold text-lavender-500 mb-4 flex items-center gap-1.5">
              <span>🌸</span> crochet.softdiaries
            </h4>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed italic">
              “Where yarn meets imagination.”
            </p>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Every single product we shape is designed with premium wool, warm tea, and cozy imagination to become an everlasting token of love.
            </p>
          </div>

          {/* Quick Shop Links */}
          <div>
            <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 tracking-wider uppercase mb-4">
              Explore Our Shop
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <button onClick={() => setActiveTab('shop')} className="hover:text-lavender-500 transition-colors">
                  All Products
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('shop')} className="hover:text-lavender-500 transition-colors">
                  Crochet Bouquet Series
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('shop')} className="hover:text-lavender-500 transition-colors">
                  Mini Potted Pots
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('custom-order')} className="hover:text-lavender-500 transition-colors">
                  Bespoke Custom Orders
                </button>
              </li>
            </ul>
          </div>

          {/* Help & Boutique Links */}
          <div>
            <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 tracking-wider uppercase mb-4">
              Information & Help
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <button onClick={() => setActiveTab('about')} className="hover:text-lavender-500 transition-colors">
                  Our Handcrafted Story
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('gallery')} className="hover:text-lavender-500 transition-colors">
                  Inspiration Gallery
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('faq')} className="hover:text-lavender-500 transition-colors">
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('contact')} className="hover:text-lavender-500 transition-colors">
                  Get in Touch
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 tracking-wider uppercase mb-4">
              Vadodara Boutique
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-lavender-400 shrink-0 mt-0.5" />
                <span>Vadodara, Gujarat, India - 390025</span>
              </li>
              <li className="flex items-center gap-2">
                <Instagram className="w-5 h-5 text-lavender-400 shrink-0" />
                <a
                  href="https://instagram.com/crochet.softdiaries"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-lavender-500 transition-colors"
                >
                  @crochet.softdiaries
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-lavender-400 shrink-0" />
                <span>+91 7016917377</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-lavender-400 shrink-0" />
                <span>hello@softdairies.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* copyright */}
        <div className="mt-12 pt-8 border-t border-lavender-100 dark:border-zinc-800/60 text-center flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-zinc-400">
          <p>© {new Date().getFullYear()} crochet.softdiaries. Hand-stitched with love in Vadodara, India.</p>
          <p className="flex items-center gap-1">
            Where yarn meets imagination <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
          </p>
        </div>
      </div>
    </footer>
  );
}
