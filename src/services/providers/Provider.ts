export interface StoreItem {
  name: string;
  price: number;
  unit: string;
  store: string;
  availability: 'in_stock' | 'out_of_stock' | 'limited';
}

export interface Provider {
  name: string;
  search(query: string, zip?: string): Promise<StoreItem[]>;
}
