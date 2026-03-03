
"use client";

import { create } from 'zustand';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  averageDailySales: number;
  leadTimeDays: number;
  safetyStock: number;
  supplierId: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
}

export interface Transaction {
  id: string;
  productId: string;
  productName: string;
  type: 'purchase' | 'sale';
  quantity: number;
  date: string;
  notes?: string;
}

interface InventoryState {
  products: Product[];
  suppliers: Supplier[];
  transactions: Transaction[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
}

const INITIAL_SUPPLIERS: Supplier[] = [
  { id: 'S1', name: 'TechSupply Co.', contactName: 'John Smith', email: 'john@techsupply.com', phone: '555-0101' },
  { id: 'S2', name: 'OfficePro Inc.', contactName: 'Sarah Wilson', email: 'sarah@officepro.com', phone: '555-0202' },
];

const INITIAL_PRODUCTS: Product[] = [
  { id: 'P1', name: 'Wireless Mouse', category: 'Accessories', price: 25.99, quantity: 15, averageDailySales: 2.5, leadTimeDays: 5, safetyStock: 20, supplierId: 'S1' },
  { id: 'P2', name: 'Mechanical Keyboard', category: 'Accessories', price: 89.99, quantity: 45, averageDailySales: 1.2, leadTimeDays: 7, safetyStock: 10, supplierId: 'S1' },
  { id: 'P3', name: 'Monitor Stand', category: 'Furniture', price: 45.00, quantity: 8, averageDailySales: 0.5, leadTimeDays: 10, safetyStock: 5, supplierId: 'S2' },
  { id: 'P4', name: 'USB-C Hub', category: 'Accessories', price: 35.50, quantity: 60, averageDailySales: 3.0, leadTimeDays: 3, safetyStock: 15, supplierId: 'S1' },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 'T1', productId: 'P1', productName: 'Wireless Mouse', type: 'sale', quantity: 5, date: new Date(Date.now() - 86400000).toISOString(), notes: 'Customer Order #101' },
  { id: 'T2', productId: 'P4', productName: 'USB-C Hub', type: 'purchase', quantity: 50, date: new Date(Date.now() - 172800000).toISOString(), notes: 'Restock from Supplier S1' },
];

export const useStore = create<InventoryState>((set) => ({
  products: INITIAL_PRODUCTS,
  suppliers: INITIAL_SUPPLIERS,
  transactions: INITIAL_TRANSACTIONS,
  addProduct: (product) => set((state) => ({
    products: [...state.products, { ...product, id: Math.random().toString(36).substring(2, 11) }]
  })),
  updateProduct: (id, updatedFields) => set((state) => ({
    products: state.products.map((p) => (p.id === id ? { ...p, ...updatedFields } : p))
  })),
  deleteProduct: (id) => set((state) => ({
    products: state.products.filter((p) => p.id !== id)
  })),
  addSupplier: (supplier) => set((state) => ({
    suppliers: [...state.suppliers, { ...supplier, id: Math.random().toString(36).substring(2, 11) }]
  })),
  updateSupplier: (id, updatedFields) => set((state) => ({
    suppliers: state.suppliers.map((s) => (s.id === id ? { ...s, ...updatedFields } : s))
  })),
  deleteSupplier: (id) => set((state) => ({
    suppliers: state.suppliers.filter((s) => s.id !== id)
  })),
  addTransaction: (transaction) => set((state) => {
    const id = Math.random().toString(36).substring(2, 11);
    const newTx = { ...transaction, id };
    
    const products = state.products.map(p => {
      if (p.id === transaction.productId) {
        const delta = transaction.type === 'purchase' ? transaction.quantity : -transaction.quantity;
        return { ...p, quantity: Math.max(0, p.quantity + delta) };
      }
      return p;
    });

    return {
      transactions: [newTx, ...state.transactions],
      products
    };
  }),
}));
