export type PriceMode = 'fijo' | 'desde' | 'consultar';
export type Availability = 'entrega inmediata' | 'por pedido';

export interface ProductLike {
  id: string;
  name: string;
  category: string;
  price?: number;
  priceMode: PriceMode;
  featured: boolean;
  visible: boolean;
  order: number;
  measures?: string;
  colors?: string;
  customizable?: boolean;
  shipping?: string;
  availability?: Availability;
}

export interface CategoryLike {
  id: string;
  label: string;
  order: number;
}

export interface FichaRow {
  label: string;
  value: string;
}
