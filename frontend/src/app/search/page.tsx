"use client";

import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import FilterSidebar from '@/components/FilterSidebar';
import { apiRequest } from "@/services/app";
import { ChevronLeft, ChevronRight, Search, ArrowUpDown } from 'lucide-react';
import { Product, Brand, Category } from '@/types';

const PRODUCTS_PER_PAGE = 8;

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || ""; 

  // States
  const [currentPage, setCurrentPage] = useState(1);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);

  // Filter & Sort States
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("id");
  const [sortDir, setSortDir] = useState<string>("asc");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch Brands on Mount
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await apiRequest(`/api/brands?page_size=100`, 'GET');
        const res = await response.json();
        if (res.code === 200 && res.result) {
          setBrands(res.result.content);
        }
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
    };
    fetchBrands();
  }, []);

  // Reset page when query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  const fetchSearchResults = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {
        page_no: (currentPage - 1).toString(),
        page_size: PRODUCTS_PER_PAGE.toString(),
        sortBy: sortBy,
        sortDir: sortDir
      };
      
      if (query) params.name = query;
      if (selectedBrand) params.brand_id = selectedBrand;
      if (minPrice) params.min_price = minPrice;
      if (maxPrice) params.max_price = maxPrice;
      if (selectedColor) params.color = selectedColor;

      const queryParams = new URLSearchParams(params).toString();

      const response = await apiRequest(`/api/products?${queryParams}`, 'GET');
      const res = await response.json();
      
      if (res.code === 200 && res.result) {
        setSearchResults(res.result.content.map((p: Product) => {
          const uniqueColors = Array.from(new Set((p.variants || []).map(v => v.color)));
          return {
            ...p,
            category: (p.category as Category)?.name || "Khác",
            colors: uniqueColors
          };
        }));
        setTotalProducts(res.result.total);
      } else {
        setSearchResults([]);
        setTotalProducts(0);
      }
    } catch (error) {
      console.error("Error searching products:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, query, selectedBrand, minPrice, maxPrice, selectedColor, sortBy, sortDir]);

  // Fetch when page, query or filters change
  useEffect(() => {
    fetchSearchResults();
  }, [fetchSearchResults]);

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
      {/* Tiêu đề kết quả tìm kiếm & Lọc/Sắp xếp */}
      <div className="mb-8 border-b border-gray-100 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-medium text-gray-800 uppercase tracking-widest">
            {query ? `Kết quả tìm kiếm cho "${query}"` : "Tất cả sản phẩm"}
          </h1>
          <p className="text-gray-500 mt-2">
            Tìm thấy <strong>{totalProducts}</strong> sản phẩm phù hợp.
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
          {/* Loading State */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-blue-500">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="font-medium animate-pulse">Đang tải sản phẩm...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-12 mb-12">
                {searchResults.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* THANH PHÂN TRANG (PAGINATION UI) */}
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
            /* Giao diện khi không tìm thấy kết quả nào */
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
              <Search size={60} className="text-gray-300 mb-6" />
              <h2 className="text-xl font-bold text-gray-800 mb-2 uppercase tracking-wide">Không tìm thấy sản phẩm nào!</h2>
              <p className="font-medium text-center max-w-md">Xin lỗi, chúng tôi không tìm thấy sản phẩm nào khớp với bộ lọc hoặc từ khóa của bạn. Vui lòng thử lại.</p>
            </div>
          )}
        </div>

        {/* BỘ LỌC TÌM KIẾM NÂNG CAO (Drawer) */}
        {showFilters && (
          <>
            {/* Backdrop - No Blur, transparent */}
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

// Trang chính
export default function SearchPage() {
  return (
    <main className="min-h-screen bg-white font-sans text-gray-900">
      <Navbar />
      <Suspense fallback={<div className="pt-32 text-center text-gray-500 font-medium">Đang tìm kiếm...</div>}>
        <SearchContent />
      </Suspense>
    </main>
  );
}
