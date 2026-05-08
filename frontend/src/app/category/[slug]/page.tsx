"use client";

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import FilterSidebar from '@/components/FilterSidebar';
import { apiRequest } from '@/services/app';
import { ChevronLeft, ChevronRight, Search, ArrowUpDown } from 'lucide-react';
import { Product } from '@/types';

const PRODUCTS_PER_PAGE = 8;

interface Brand {
  id: number;
  name: string;
}

function CategoryContent() {
  const params = useParams();
  const slug = params?.slug;

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryTitle, setCategoryTitle] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);

  // Filter & Sort States
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("id");
  const [sortDir, setSortDir] = useState<string>("asc");
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Fetch Brands and Category ID
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch Brands
        const brandResponse = await apiRequest(`/api/brands?page_size=100`, 'GET');
        const brandRes = await brandResponse.json();
        if (brandRes.code === 200 && brandRes.result) {
          setBrands(brandRes.result.content);
        }

        // Fetch Categories to find ID
        const catResponse = await apiRequest('/api/categories', 'GET');
        const catRes = await catResponse.json();
        const categories: { id: number; name: string }[] = catRes.result?.content || [];

        const SLUG_TO_NAME: Record<string, string> = {
          "nu": "Giày Thể Thao Nữ",
          "nam": "Giày Thể Thao Nam",
          "cap": "Giày Cặp",
          "banchay": "Sản phẩm bán chạy"
        };

        const targetCategoryName = SLUG_TO_NAME[slug as string] || "";
        const title = slug === "banchay" ? "SẢN PHẨM BÁN CHẠY" : targetCategoryName.toUpperCase();

        const found = categories.find(
          (c) => c.name.toLowerCase() === targetCategoryName.toLowerCase()
        );
        
        if (found) {
          setCategoryId(found.id);
          setCategoryTitle(found.name.toUpperCase());
        } else {
           setCategoryTitle(title || "DANH MỤC");
        }

      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };
    fetchInitialData();
  }, [slug]);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const queryParams: Record<string, string> = {
        page_no: (currentPage - 1).toString(),
        page_size: PRODUCTS_PER_PAGE.toString(),
        sortBy: sortBy,
        sortDir: sortDir
      };

      if (categoryId) queryParams.category_id = categoryId.toString();
      if (selectedBrand) queryParams.brand_id = selectedBrand;
      if (minPrice) queryParams.min_price = minPrice;
      if (maxPrice) queryParams.max_price = maxPrice;
      if (selectedColor) queryParams.color = selectedColor;

      const queryString = new URLSearchParams(queryParams).toString();
      const endpoint = slug === "banchay" ? `/api/products/best-sellers?${queryString}` : `/api/products?${queryString}`;
      const response = await apiRequest(endpoint, 'GET');
      const res = await response.json();

      if (res.code === 200 && res.result) {
        setProducts(res.result.content.map((p: { 
          category?: { name: string }, 
          variants?: { color: string }[] 
        }) => {
          const uniqueColors = Array.from(new Set((p.variants || []).map(v => v.color)));
          return {
            ...p,
            category: p.category?.name || "Khác",
            colors: uniqueColors
          };
        }));
        setTotalProducts(res.result.total);
      }
    } catch (error) {
      console.error("Error fetching category products:", error);
    } finally {
      setIsLoading(false);
    }
  }, [slug, categoryId, currentPage, sortBy, sortDir, selectedBrand, minPrice, maxPrice, selectedColor]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Tự động lọc khi các state thay đổi (Debounce cho giá)
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [selectedBrand, minPrice, maxPrice, selectedColor, sortBy, sortDir]);

  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

  return (
    <div className="pt-24 pb-20 container mx-auto px-4">
      {/* Header */}
      <div className="mb-8 border-b border-gray-100 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-medium text-gray-800 uppercase tracking-widest">
            {categoryTitle}
          </h1>
          <p className="text-gray-500 mt-2">
            Tìm thấy <strong>{totalProducts}</strong> sản phẩm.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Sắp xếp */}
          <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
            <ArrowUpDown size={16} className="text-gray-400" />
            <select 
              value={`${sortBy}-${sortDir}`}
              onChange={(e) => {
                const [newSortBy, newSortDir] = e.target.value.split('-');
                setSortBy(newSortBy);
                setSortDir(newSortDir);
              }}
              className="bg-transparent text-sm font-bold text-gray-700 focus:outline-none cursor-pointer"
            >
              <option value="id-asc">Mặc định</option>
              <option value="price-asc">Giá: Thấp đến Cao</option>
              <option value="price-desc">Giá: Cao đến Thấp</option>
              <option value="name-asc">Tên: A-Z</option>
            </select>
          </div>

          {/* Toggle Lọc */}
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border transition-all font-bold text-sm ${
              showFilters 
              ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100" 
              : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-arrow-up-down transition-colors ${showFilters ? 'text-white' : 'text-gray-400'}`} aria-hidden="true">
              <path d="m21 16-4 4-4-4"/>
              <path d="M17 20V4"/>
              <path d="m3 8 4-4 4 4"/>
              <path d="M7 4v16"/>
            </svg>
            Bộ lọc
          </button>
        </div>
      </div>

      <div className="relative">
        {/* DANH SÁCH SẢN PHẨM */}
        <div className="w-full">
          {/* List */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-blue-500">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="font-medium animate-pulse">Đang tải sản phẩm...</p>
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-12 mb-12">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                    disabled={currentPage === 1} 
                    className={`w-10 h-10 flex items-center justify-center border rounded-lg transition ${currentPage === 1 ? "border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50" : "border-gray-300 text-gray-600 bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 shadow-sm"}`}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  
                  {Array.from({ length: totalPages }).map((_, index) => {
                    const pageNumber = index + 1;
                    return (
                      <button 
                        key={pageNumber} 
                        onClick={() => setCurrentPage(pageNumber)} 
                        className={`w-10 h-10 flex items-center justify-center border rounded-lg font-bold transition shadow-sm ${currentPage === pageNumber ? "border-blue-600 bg-blue-600 text-white shadow-md" : "border-gray-300 bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"}`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}

                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                    disabled={currentPage === totalPages} 
                    className={`w-10 h-10 flex items-center justify-center border rounded-lg transition ${currentPage === totalPages ? "border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50" : "border-gray-300 text-gray-600 bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 shadow-sm"}`}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
              <Search size={60} className="text-gray-300 mb-6" />
              <h2 className="text-xl font-bold text-gray-800 mb-2 uppercase tracking-wide">Không tìm thấy sản phẩm nào!</h2>
              <p className="font-medium text-center max-w-md">Xin lỗi, chúng tôi không tìm thấy sản phẩm nào khớp với bộ lọc của bạn. Vui lòng thử lại.</p>
            </div>
          )}
        </div>

        {/* BỘ LỌC (Drawer) */}
        {showFilters && (
          <>
            {/* Backdrop - Transparent */}
            <div 
              onClick={() => setShowFilters(false)} 
              className="fixed inset-0 z-[140] animate-in fade-in duration-300" 
            />

            {/* Sidebar Drawer */}
            <div className="fixed top-0 right-0 h-full w-full max-w-xs bg-white z-[150] shadow-2xl animate-in slide-in-from-right duration-300 overflow-y-auto border-l border-gray-100">
              <div className="p-8 pt-24">
                <FilterSidebar 
                  brands={brands}
                  selectedBrand={selectedBrand}
                  setSelectedBrand={setSelectedBrand}
                  minPrice={minPrice}
                  setMinPrice={setMinPrice}
                  maxPrice={maxPrice}
                  setMaxPrice={setMaxPrice}
                  selectedColor={selectedColor}
                  setSelectedColor={setSelectedColor}
                  onClear={() => {
                    setSelectedBrand("");
                    setMinPrice("");
                    setMaxPrice("");
                    setSelectedColor("");
                    setCurrentPage(1);
                  }}
                  onClose={() => setShowFilters(false)}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function CategoryPage() {
  return (
    <main className="min-h-screen bg-white font-sans text-gray-900">
      <Navbar />
      <Suspense fallback={<div className="pt-32 text-center text-gray-500 font-medium">Đang tải...</div>}>
        <CategoryContent />
      </Suspense>
    </main>
  );
}