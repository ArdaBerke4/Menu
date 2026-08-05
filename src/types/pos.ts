export interface Table {
  id: string;
  restaurant_id: string;
  table_number: number;
  label?: string;
  capacity: number;
  status: 'empty' | 'occupied' | 'reserved';
  needs_waiter?: boolean;
  created_at?: string;
}

export interface Order {
  id: string;
  restaurant_id: string;
  table_id: string | null;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled' | 'paid';
  total_amount: number;
  note?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SelectedOption {
  groupName: string;
  choiceName: string;
  price: number;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  note?: string;
  selected_options?: SelectedOption[];
  created_at?: string;
}
