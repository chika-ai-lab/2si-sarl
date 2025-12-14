import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface WishlistState {
  items: string[]; // Product IDs
}

interface WishlistContextType {
  items: string[];
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => void;
  clearWishlist: () => void;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = "progresspay_wishlist";

function loadWishlistFromStorage(): string[] {
  try {
    const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to load wishlist from localStorage:", error);
    return [];
  }
}

function saveWishlistToStorage(items: string[]) {
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Failed to save wishlist to localStorage:", error);
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const loadedItems = loadWishlistFromStorage();
    setItems(loadedItems);
    setIsInitialized(true);
  }, []);

  // Save to localStorage whenever items change (but only after initialization)
  useEffect(() => {
    if (isInitialized) {
      saveWishlistToStorage(items);
    }
  }, [items, isInitialized]);

  const addToWishlist = (productId: string) => {
    setItems((prev) => {
      if (prev.includes(productId)) {
        return prev; // Already in wishlist
      }
      return [...prev, productId];
    });
  };

  const removeFromWishlist = (productId: string) => {
    setItems((prev) => prev.filter((id) => id !== productId));
  };

  const isInWishlist = (productId: string): boolean => {
    return items.includes(productId);
  };

  const toggleWishlist = (productId: string) => {
    if (isInWishlist(productId)) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(productId);
    }
  };

  const clearWishlist = () => {
    setItems([]);
  };

  const value: WishlistContextType = {
    items,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
    clearWishlist,
    wishlistCount: items.length,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
