export interface Product {
  id: string;
  title: string;
  englishTitle: string;
  description: string;
  price: number;
  unit: string;
  badge: string;
  colorTheme: 'berry' | 'orange' | 'green' | 'mixed' | 'yellow';
  accentHex: string;
  bgLightHex: string;
  image: string;
  availability: boolean;
  caloriesEstimate?: string;
  freshnessNote?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
