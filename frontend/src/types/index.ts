export interface Category {
  id: number;
  name: string;
}

export interface Brand {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  image?: string;
  imageUrl?: string;
  category: Category | string;
  description?: string;
  colors?: string[]; // THÊM DÒNG NÀY ĐỂ LƯU MÃ MÀU (Hex code)
  sizes?: (string | number)[];
  brand?: Brand | string;
  discountPercentage?: number;
  variants?: { id: number, color: string, size: string, quantity: number }[];
  images?: string[];
}