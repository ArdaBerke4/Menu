export interface Restaurant {
  id: string;
  name: string;
  user_id: string;
  logo_url?: string;
  primary_color?: string;
  font_family?: string;
  font_size?: string;
  background_color?: string;
  background_image_url?: string;
  button_shape?: string;
  description?: string;
  address?: string;
  layout_style?: 'list' | 'grid';
  header_style?: 'center' | 'left' | 'banner';
  nav_style?: 'scroll' | 'tabs';
  card_bg_color?: string;
  qr_dot_color?: string;
  qr_bg_color?: string;
  qr_dot_style?: string;
  qr_corner_style?: string;
  qr_use_logo?: boolean;
  slug?: string;
  email?: string;
}

export interface Category {
  id: string;
  name: string;
  restaurant_id: string;
  sort_order?: number;
  pos_x?: number;
  pos_y?: number;
}

export interface ProductOptionChoice {
  name: string;
  price: number;
}

export interface ProductOption {
  name: string;
  type: 'single' | 'multiple';
  required: boolean;
  choices: ProductOptionChoice[];
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category_id: string;
  image_url?: string;
  sort_order?: number;
  options?: ProductOption[];
}

export interface Campaign {
  id: string;
  restaurant_id: string;
  name: string;
  discount_percent: number;
  category_id: string | null;
  is_active: boolean;
  created_at?: string;
}

export interface StaffAccount {
  id: string;
  restaurant_id: string;
  username: string;
  role: 'waiter' | 'chef';
  created_at: string;
}
