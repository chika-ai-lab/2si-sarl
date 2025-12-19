import React, { createContext, useContext, useReducer, ReactNode, useCallback, useEffect } from "react";
import { paymentConfig } from "@/config/payments.config";

const CART_STORAGE_KEY = "2si-cart-state";

export interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
}

interface CartState {
  items: CartItem[];
  selectedPlanId: string;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "SET_PAYMENT_PLAN"; payload: string }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: CartState };

interface CartContextType extends CartState {
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  setPaymentPlan: (planId: string) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTotal: () => number;
  getMonthlyPayment: () => number;
  getInterest: () => number;
  getItemCount: () => number;
  getSelectedPlan: () => typeof paymentConfig.plans[0] | undefined;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Load cart from localStorage
function loadCartFromStorage(): CartState {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        items: parsed.items || [],
        selectedPlanId: parsed.selectedPlanId || paymentConfig.defaultPlanId,
      };
    }
  } catch (error) {
    console.error("Failed to load cart from localStorage:", error);
  }
  return {
    items: [],
    selectedPlanId: paymentConfig.defaultPlanId,
  };
}

// Save cart to localStorage
function saveCartToStorage(state: CartState): void {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save cart to localStorage:", error);
  }
}

function cartReducer(state: CartState, action: CartAction): CartState {
  let newState: CartState;

  switch (action.type) {
    case "LOAD_CART":
      return action.payload;
    case "ADD_ITEM": {
      const existingIndex = state.items.findIndex((item) => item.id === action.payload.id);
      if (existingIndex >= 0) {
        const newItems = [...state.items];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + action.payload.quantity,
        };
        newState = { ...state, items: newItems };
      } else {
        newState = { ...state, items: [...state.items, action.payload] };
      }
      saveCartToStorage(newState);
      return newState;
    }
    case "REMOVE_ITEM":
      newState = {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };
      saveCartToStorage(newState);
      return newState;
    case "UPDATE_QUANTITY": {
      if (action.payload.quantity <= 0) {
        newState = {
          ...state,
          items: state.items.filter((item) => item.id !== action.payload.id),
        };
      } else {
        newState = {
          ...state,
          items: state.items.map((item) =>
            item.id === action.payload.id
              ? { ...item, quantity: action.payload.quantity }
              : item
          ),
        };
      }
      saveCartToStorage(newState);
      return newState;
    }
    case "SET_PAYMENT_PLAN":
      newState = { ...state, selectedPlanId: action.payload };
      saveCartToStorage(newState);
      return newState;
    case "CLEAR_CART":
      newState = { items: [], selectedPlanId: paymentConfig.defaultPlanId };
      saveCartToStorage(newState);
      return newState;
    default:
      return state;
  }
}

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    selectedPlanId: paymentConfig.defaultPlanId,
  });

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = loadCartFromStorage();
    dispatch({ type: "LOAD_CART", payload: savedCart });
  }, []);

  const addItem = useCallback((item: Omit<CartItem, "quantity">) => {
    dispatch({ type: "ADD_ITEM", payload: { ...item, quantity: 1 } });
  }, []);

  const removeItem = useCallback((id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id });
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
  }, []);

  const setPaymentPlan = useCallback((planId: string) => {
    dispatch({ type: "SET_PAYMENT_PLAN", payload: planId });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" });
  }, []);

  const getSubtotal = useCallback(() => {
    return state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [state.items]);

  const getSelectedPlan = useCallback(() => {
    return paymentConfig.plans.find((plan) => plan.id === state.selectedPlanId);
  }, [state.selectedPlanId]);

  const getInterest = useCallback(() => {
    const subtotal = getSubtotal();
    const plan = getSelectedPlan();
    if (!plan) return 0;
    return subtotal * (plan.interestRate / 100) * (plan.months / 12);
  }, [getSubtotal, getSelectedPlan]);

  const getTotal = useCallback(() => {
    return getSubtotal() + getInterest();
  }, [getSubtotal, getInterest]);

  const getMonthlyPayment = useCallback(() => {
    const total = getTotal();
    const plan = getSelectedPlan();
    if (!plan) return 0;
    return total / plan.months;
  }, [getTotal, getSelectedPlan]);

  const getItemCount = useCallback(() => {
    return state.items.reduce((sum, item) => sum + item.quantity, 0);
  }, [state.items]);

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        removeItem,
        updateQuantity,
        setPaymentPlan,
        clearCart,
        getSubtotal,
        getTotal,
        getMonthlyPayment,
        getInterest,
        getItemCount,
        getSelectedPlan,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
