import { Product } from "@/types";
import { apiRequest } from "@/services/app";

export interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
  size?: string | null;
  color?: string | null;
}

export const getCart = async (): Promise<CartItem[]> => {
  // Kiểm tra token trước khi gọi API
  const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;
  if (!token || token === "fail") return [];

  try {
    const response = await apiRequest("/api/cart", "GET");
    if (!response.ok) return [];
    const data = await response.json();
    if (data.code === 200 && Array.isArray(data.result)) {
      return data.result.map((item: { 
        id: number, 
        product: { id: number, name: string, price: number, imageUrl?: string, image?: string, category?: { name: string } }, 
        quantity: number, 
        size?: string, 
        color?: string 
      }) => ({
        id: item.id,
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.imageUrl || item.product.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400",
        category: item.product.category?.name || "Giày",
        size: item.size,
        color: item.color
      }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching cart:", error);
    return [];
  }
};

export const addToCart = async (product: Product, quantity: number, size?: string | null, color?: string | null) => {
  try {
    const response = await apiRequest("/api/cart", "POST", {
      productId: product.id,
      quantity,
      size,
      color
    });
    if (response.ok) {
      window.dispatchEvent(new Event("cartUpdated"));
    }
    return response.ok;
  } catch (error) {
    console.error("Error adding to cart:", error);
    return false;
  }
};

export const updateQuantity = async (id: number, quantity: number) => {
  try {
    const response = await apiRequest(`/api/cart/${id}`, "PUT", {
      quantity
    });
    if (response.ok) {
      window.dispatchEvent(new Event("cartUpdated"));
    }
    return response.ok;
  } catch (error) {
    console.error("Error updating quantity:", error);
    return false;
  }
};

export const removeFromCart = async (id: number) => {
  try {
    const response = await apiRequest(`/api/cart/${id}`, "DELETE");
    if (response.ok) {
      window.dispatchEvent(new Event("cartUpdated"));
    }
    return response.ok;
  } catch (error) {
    console.error("Error removing from cart:", error);
    return false;
  }
};

export const clearCart = async () => {
  try {
    const response = await apiRequest("/api/cart/clear", "DELETE");
    if (response.ok) {
      window.dispatchEvent(new Event("cartUpdated"));
    }
    return response.ok;
  } catch (error) {
    console.error("Error clearing cart:", error);
    return false;
  }
};

export const getCartCount = async (): Promise<number> => {
  const cart = await getCart();
  return cart.reduce((total, item) => total + item.quantity, 0);
};
