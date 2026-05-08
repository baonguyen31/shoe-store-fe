'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { apiRequest } from '@/services/app';
import { Product } from "@/types";
import { addToCart } from '@/utils/cartUtils';
import Navbar from '@/components/Navbar';
import toast from 'react-hot-toast';
import { 
  Heart, 
  Plus,
  Minus,
  Loader2 
} from 'lucide-react';

interface Variant {
  id: number;
  color: string;
  size: string;
  quantity: number;
}

// Bảng mã màu Hex code để hiển thị màu sắc chuẩn xác
const COLOR_HEX_MAP: Record<string, string> = {
  "Đen": "#171717",
  "Trắng": "#FFFFFF",
  "Đỏ": "#991B1B",    // Đỏ mận/Đỏ đô sang trọng
  "Nâu": "#78350F",    // Nâu da bò
  "Be": "#D4B996",     // Đã chỉnh lại màu Be (Nude/Beige) đậm và thực tế hơn
  "Xám": "#6B7280",
  "Kem": "#FEFCE8",
  "Xanh": "#1E40AF",
  "Vàng": "#EAB308"
};

// Hàm kiểm tra màu sáng/tối để đổi màu chữ tự động cho dễ đọc
const isLightColor = (colorName: string) => {
  return ["Trắng", "Be", "Kem"].includes(colorName);
};

export default function ProductDetailPage() {
  const router = useRouter();
  // --- LẤY ID THỰC TẾ TỪ URL ---
  const params = useParams();
  const productId = params?.id as string;


  // --- STATE ---
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<string | null>('description');

  // --- GỌI API LẤY DỮ LIỆU ---
  useEffect(() => {
    if (!productId) return; 

    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const response = await apiRequest(`/api/products/${productId}`, 'GET');
        if (!response.ok) {
          const errorData = await response.text();
          console.error("API Error Response:", errorData);
          throw new Error("Lỗi tải dữ liệu từ máy chủ");
        }
        const res = await response.json();
        if (res.code === 200 && res.result) {
          const apiProduct = res.result;
          
          // Chuyển đổi dữ liệu API sang định dạng hiển thị
          const variants: Variant[] = apiProduct.variants || [];
          
          // Lấy danh sách màu sắc duy nhất từ biến thể
          const uniqueColors = Array.from(new Set(variants.map((v: Variant) => v.color))) as string[];
          const colors = uniqueColors;
          
          // Lấy danh sách kích thước duy nhất từ biến thể
          const uniqueSizes = Array.from(new Set(variants.map((v: Variant) => v.size))).sort() as string[];
          const sizes = uniqueSizes;

          const foundProduct: Product = {
            id: apiProduct.id,
            name: apiProduct.name,
            price: apiProduct.price,
            category: apiProduct.category?.name || 'Giày',
            description: apiProduct.description || 'Chưa có mô tả',
            brand: apiProduct.brand?.name || 'SHOESTORE',
            discountPercentage: apiProduct.discountPercentage || 0,
            variants: variants,
            sizes: sizes,
            colors: colors,
            images: [
              apiProduct.imageUrl || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop"
            ]
          };

          setProduct(foundProduct);
          
          // Chọn màu đầu tiên có hàng
          const firstAvailableColor = colors.find(c => 
            variants.some((v: Variant) => v.color === c && v.quantity > 0)
          ) || colors[0];
          
          setSelectedColor(firstAvailableColor);

          // Chọn size đầu tiên có hàng của màu đó
          const availableSizesForColor = sizes.filter(s => 
            variants.some((v: Variant) => v.color === firstAvailableColor && v.size === String(s) && v.quantity > 0)
          );
          setSelectedSize(availableSizesForColor.length > 0 ? availableSizesForColor[0] : String(sizes[0]));
        } else {
          setError(res.message || "Không tìm thấy sản phẩm");
        }
      } catch {
        setError("Lỗi kết nối đến máy chủ. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const formatPrice = (p: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  // Màn hình Error
  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <p className="font-medium text-red-500 uppercase tracking-widest text-sm mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition">Thử lại</button>
      </div>
    );
  }

  // Màn hình Loading
  if (isLoading || !product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-gray-900 animate-spin mb-4" />
        <p className="font-medium text-gray-500 uppercase tracking-widest text-sm">Đang tải thông tin...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white font-sans">
      {/* --- HEADER --- */}
      <Navbar />

      {/* --- LAYOUT CHÍNH (CHIA 2 CỘT) --- */}
      <div className="max-w-[1400px] mx-auto pt-16 grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-16">
        
        {/* ================= CỘT TRÁI: DÃY ẢNH ================= */}
        <div className="lg:col-span-7 flex flex-col">
          {product.images?.map((img: string, idx: number) => (
            <div key={idx} className="w-full bg-gray-50 border-b border-gray-100 last:border-b-0 relative">
              <Image 
                src={img} 
                alt={`${product.name} - Góc ${idx + 1}`} 
                width={1200}
                height={1200}
                className="w-full h-auto object-cover"
                priority={idx === 0}
              />
            </div>
          ))}
        </div>

        {/* ================= CỘT PHẢI: THÔNG TIN ================= */}
        <div className="lg:col-span-5 px-6 lg:px-0 py-10 lg:py-16 relative">
          <div className="sticky top-24 max-w-md">
            
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs text-gray-500 font-medium tracking-widest uppercase">
                {typeof product.category === 'string' ? product.category : product.category?.name}
              </span>
              <button className="text-gray-400 hover:text-red-500 transition-colors">
                <Heart size={20} />
              </button>
            </div>
            
            <h1 className="text-2xl font-medium text-gray-900 leading-tight tracking-wide mb-4 uppercase">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-10">
              <span className="text-xl font-medium text-gray-900">
                {formatPrice(product.price)}
              </span>
              {product.discountPercentage !== undefined && product.discountPercentage > 0 && (
                <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">
                  -{product.discountPercentage}%
                </span>
              )}
            </div>

            {/* CHỌN KÍCH THƯỚC */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-medium text-gray-900 uppercase tracking-widest">Kích thước</span>
                <button className="text-xs text-gray-500 underline hover:text-gray-900 transition-colors font-medium">Bảng kích cỡ</button>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {product.sizes?.map((size: string | number) => {
                  const variant = product.variants?.find((v: Variant) => v.color === selectedColor && v.size === String(size));
                  const isOutOfStock = (product.variants?.length || 0) > 0 && (!variant || variant.quantity <= 0);
                  
                  return (
                    <button
                      key={size}
                      disabled={isOutOfStock}
                      onClick={() => setSelectedSize(String(size))}
                      className={`py-3 rounded-none text-sm font-medium transition-all border relative
                        ${selectedSize === String(size) 
                          ? 'border-gray-900 bg-gray-900 text-white' 
                          : 'border-gray-200 text-gray-900 hover:border-gray-900 bg-white'}
                        ${isOutOfStock ? 'opacity-30 cursor-not-allowed bg-gray-50 border-dashed' : ''}`}
                    >
                      {size}
                      {isOutOfStock && <div className="absolute inset-0 flex items-center justify-center"><div className="w-full h-[1px] bg-gray-400 rotate-45"></div></div>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CHỌN MÀU SẮC */}
            <div className="mb-6">
              <span className="text-xs font-medium text-gray-900 uppercase tracking-widest block mb-4">Màu sắc</span>
              <div className="flex flex-wrap gap-3">
                {product.colors?.map((color: string) => {
                  const isSelected = selectedColor === color;
                  const hexValue = COLOR_HEX_MAP[color] || "#000000";
                  
                  // Kiểm tra màu này còn hàng không (bất kỳ size nào)
                  const hasStock = (product.variants?.length || 0) === 0 || product.variants?.some((v: Variant) => v.color === color && v.quantity > 0);
                  
                  // Tính toán màu nền và màu chữ dựa trên trạng thái
                  const bgColor = isSelected ? hexValue : "#ffffff";
                  const textColor = isSelected 
                    ? (isLightColor(color) ? "#111827" : "#ffffff") 
                    : "#111827";

                  return (
                    <button
                      key={color}
                      disabled={!hasStock}
                      onClick={() => {
                        setSelectedColor(color);
                        // Khi đổi màu, tự động chọn size đầu tiên còn hàng của màu mới
                        const availableSize = product.sizes?.find((s: string | number) => 
                          product.variants?.some((v: Variant) => v.color === color && v.size === String(s) && v.quantity > 0)
                        );
                        if (availableSize) setSelectedSize(String(availableSize));
                      }}
                      className={`flex items-center gap-2.5 px-5 py-2.5 text-xs font-medium transition-all border uppercase tracking-widest relative
                        ${isSelected 
                          ? 'border-transparent shadow-md ring-1 ring-offset-2 ring-gray-200' 
                          : 'border-gray-200 hover:border-gray-900'}
                        ${!hasStock ? 'opacity-30 cursor-not-allowed grayscale' : ''}`}
                      style={{ 
                        backgroundColor: bgColor,
                        color: textColor
                      }}
                    >
                      {!isSelected && (
                        <span 
                          className="w-3 h-3 rounded-full border border-gray-300"
                          style={{ backgroundColor: hexValue }}
                        />
                      )}
                      {color}
                      {!hasStock && <div className="absolute inset-0 flex items-center justify-center"><div className="w-full h-[1px] bg-gray-400"></div></div>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* HIỂN THỊ TỒN KHO */}
            {selectedColor && selectedSize && (product.variants?.length || 0) > 0 && (
              <div className="mb-8">
                {(() => {
                  const v = product.variants?.find((v: Variant) => v.color === selectedColor && v.size === selectedSize);
                  const q = v ? v.quantity : 0;
                  return (
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${q > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {q > 0 ? `Còn lại ${q} sản phẩm` : "Hết hàng"}
                    </p>
                  );
                })()}
              </div>
            )}

            <button 
              onClick={async () => {
                const token = sessionStorage.getItem("token");
                if (!token) {
                  toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng!");
                  router.push("/login");
                  return;
                }
                const toastId = toast.loading("Đang thêm vào giỏ hàng...");
                const success = await addToCart(product, 1, String(selectedSize), selectedColor);
                if (success) {
                  toast.success("Đã thêm vào giỏ hàng!", { id: toastId });
                } else {
                  // Nếu thất bại và token đã bị xóa (do 401 Unauthorized trong apiRequest)
                  const currentToken = sessionStorage.getItem("token");
                  if (!currentToken) {
                    toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!", { id: toastId });
                    router.push("/login");
                  } else {
                    toast.error("Lỗi khi thêm vào giỏ hàng. Vui lòng thử lại!", { id: toastId });
                  }
                }
              }}
              className="w-full bg-black text-white py-4 rounded-full font-medium text-sm uppercase tracking-widest hover:bg-gray-800 transition-colors mb-10 active:scale-95 shadow-lg shadow-gray-200">
              Thêm vào giỏ hàng
            </button>

            <p className="text-sm text-gray-600 leading-relaxed mb-8">
              {product.description}
            </p>

            {/* CÁC THẺ ACCORDION */}
            <div className="border-t border-gray-200">
              
              <div className="border-b border-gray-200">
                <button 
                  onClick={() => toggleSection('details')}
                  className="w-full py-5 flex items-center justify-between text-left focus:outline-none group"
                >
                  <span className="text-xs font-medium text-gray-900 uppercase tracking-widest group-hover:text-gray-600 transition-colors">Chi tiết sản phẩm</span>
                  {openSection === 'details' ? <Minus size={16} className="text-gray-900" /> : <Plus size={16} className="text-gray-900" />}
                </button>
                {openSection === 'details' && (
                  <div className="pb-5 text-sm text-gray-600 leading-relaxed animate-in fade-in slide-in-from-top-2">
                    <p className="mb-4">{product.description}</p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Mã sản phẩm: {product.id}</li>
                      <li>Màu sắc đã chọn: {selectedColor}</li>
                      <li>Thương hiệu: {typeof product.brand === 'string' ? product.brand : (product.brand?.name || "SHOESTORE")}</li>
                      <li>Chất liệu: Da và Vải cao cấp.</li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="border-b border-gray-200">
                <button 
                  onClick={() => toggleSection('store')}
                  className="w-full py-5 flex items-center justify-between text-left focus:outline-none group"
                >
                  <span className="text-xs font-medium text-gray-900 uppercase tracking-widest group-hover:text-gray-600 transition-colors">Dịch vụ tại cửa hàng</span>
                  {openSection === 'store' ? <Minus size={16} className="text-gray-900" /> : <Plus size={16} className="text-gray-900" />}
                </button>
                {openSection === 'store' && (
                  <div className="pb-5 text-sm text-gray-600 leading-relaxed animate-in fade-in slide-in-from-top-2">
                    Nhận hàng và thử trực tiếp tại hệ thống 15 cửa hàng SHOESTORE trên toàn quốc. Hỗ trợ vệ sinh giày miễn phí trong 6 tháng đầu cho khách hàng thành viên.
                  </div>
                )}
              </div>

              <div className="border-b border-gray-200">
                <button 
                  onClick={() => toggleSection('shipping')}
                  className="w-full py-5 flex items-center justify-between text-left focus:outline-none group"
                >
                  <span className="text-xs font-medium text-gray-900 uppercase tracking-widest group-hover:text-gray-600 transition-colors">Chính sách giao hàng và đổi hàng</span>
                  {openSection === 'shipping' ? <Minus size={16} className="text-gray-900" /> : <Plus size={16} className="text-gray-900" />}
                </button>
                {openSection === 'shipping' && (
                  <div className="pb-5 text-sm text-gray-600 leading-relaxed animate-in fade-in slide-in-from-top-2">
                    Giao hàng miễn phí toàn quốc cho đơn hàng trên 500.000đ. Thời gian giao hàng dự kiến từ 2-4 ngày làm việc. Hỗ trợ đổi size tận nhà trong vòng 7 ngày nếu không vừa.
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>

      </div>
    </main>
  );
}