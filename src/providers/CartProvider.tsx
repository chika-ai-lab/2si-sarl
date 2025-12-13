import React, { createContext, useContext, useReducer, ReactNode, useCallback } from "react";
import { paymentConfig } from "@/config/payments.config";

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
  | { type: "CLEAR_CART" };

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

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingIndex = state.items.findIndex((item) => item.id === action.payload.id);
      if (existingIndex >= 0) {
        const newItems = [...state.items];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + action.payload.quantity,
        };
        return { ...state, items: newItems };
      }
      return { ...state, items: [...state.items, action.payload] };
    }
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };
    case "UPDATE_QUANTITY": {
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((item) => item.id !== action.payload.id),
        };
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    }
    case "SET_PAYMENT_PLAN":
      return { ...state, selectedPlanId: action.payload };
    case "CLEAR_CART":
      return { items: [], selectedPlanId: paymentConfig.defaultPlanId };
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
