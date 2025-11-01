// lib/types.ts
export type MenuItem = {
  id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
  category?: string;
  ingredients?: string[];
  calories?: number;
  prepTime?: number;
  servings?: number;
  rating?: number;
  modifiers?: string[];
};

export type CartItem = MenuItem & {
  quantity: number;
};

export type Order = {
  id: number;
  tableNumber: number;
  items: CartItem[];
  timestamp: number; // ms
  status: string
};
