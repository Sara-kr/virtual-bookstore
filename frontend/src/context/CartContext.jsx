import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { cartService } from '../services';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const initialState = { cart: null, itemCount: 0, isLoading: false };

function cartReducer(state, action) {
  switch (action.type) {
    case 'SET_CART':
      return {
        ...state,
        cart: action.payload,
        itemCount: action.payload?.totalItems || 0,
        isLoading: false,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'CLEAR':
      return initialState;
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated } = useAuth();

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) return;
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await cartService.getCart();
      dispatch({ type: 'SET_CART', payload: res.data });
    } catch {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) fetchCart();
    else dispatch({ type: 'CLEAR' });
  }, [isAuthenticated, fetchCart]);

  const addToCart = useCallback(async (bookId, quantity = 1) => {
    const res = await cartService.addItem({ bookId, quantity });
    dispatch({ type: 'SET_CART', payload: res.data });
    return res.data;
  }, []);

  const updateItem = useCallback(async (itemId, quantity) => {
    const res = await cartService.updateItem(itemId, quantity);
    dispatch({ type: 'SET_CART', payload: res.data });
  }, []);

  const removeItem = useCallback(async (itemId) => {
    const res = await cartService.removeItem(itemId);
    dispatch({ type: 'SET_CART', payload: res.data });
  }, []);

  const clearCart = useCallback(async () => {
    await cartService.clearCart();
    dispatch({ type: 'CLEAR' });
  }, []);

  return (
    <CartContext.Provider value={{ ...state, fetchCart, addToCart, updateItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
