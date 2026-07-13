// src/types/index.ts

export interface Restaurant {
  id: string;
  name: string;
  logoUrl?: string; 
  themeColor: string;
}

export interface Category {
  id: string;
  name: string;
  restaurantId: string;
  displayOrder: number;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
}