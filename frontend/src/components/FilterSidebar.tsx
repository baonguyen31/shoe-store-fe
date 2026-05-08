"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface FilterSidebarProps {
  brands: { id: number | string; name: string }[];
  selectedBrand: string;
  setSelectedBrand: (val: string) => void;
  minPrice: string;
  setMinPrice: (val: string) => void;
  maxPrice: string;
  setMaxPrice: (val: string) => void;
  selectedColor: string;
  setSelectedColor: (val: string) => void;
  onClear: () => void;
  onClose?: () => void;
}

const FilterSidebar = ({
  brands,
  selectedBrand,
  setSelectedBrand,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  selectedColor,
  setSelectedColor,
  onClear,
  onClose,
}: FilterSidebarProps) => {
  // 1. State cục bộ cho input giá
  const [localMin, setLocalMin] = useState(minPrice);
  const [localMax, setLocalMax] = useState(maxPrice);

  // 2. Đồng bộ lại state cục bộ khi state từ cha thay đổi (vd: bấm nút "Xóa tất cả bộ lọc")
  useEffect(() => setLocalMin(minPrice), [minPrice]);
  useEffect(() => setLocalMax(maxPrice), [maxPrice]);

  // 3. Debounce cho minPrice: Cập nhật lên cha sau 800ms
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localMin !== minPrice) setMinPrice(localMin);
    }, 800);
    return () => clearTimeout(timer);
  }, [localMin, minPrice, setMinPrice]);

  // 4. Debounce cho maxPrice: Cập nhật lên cha sau 800ms
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localMax !== maxPrice) setMaxPrice(localMax);
    }, 800);
    return () => clearTimeout(timer);
  }, [localMax, maxPrice, setMaxPrice]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
        <h2 className="text-xl font-bold uppercase tracking-widest text-gray-900">
          Bộ lọc
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <form className="space-y-10 flex-grow">
        {/* Lọc theo Thương hiệu */}
        <div>
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-[0.2em] mb-5">
            Thương hiệu
          </h3>
          <div className="flex flex-wrap gap-2">
            {brands.map((brand) => (
              <button
                key={brand.id}
                type="button"
                onClick={() =>
                  setSelectedBrand(
                    selectedBrand === String(brand.id) ? "" : String(brand.id),
                  )
                }
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  selectedBrand === String(brand.id)
                    ? "bg-gray-900 text-white border-gray-900 shadow-md"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-900"
                }`}
              >
                {brand.name}
              </button>
            ))}
          </div>
        </div>

        {/* Lọc theo Màu sắc */}
        <div>
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-[0.2em] mb-5">
            Màu sắc
          </h3>
          <div className="flex flex-wrap gap-3">
            {[
              "Trắng",
              "Đen",
              "Đỏ",
              "Xanh",
              "Vàng",
              "Xám",
              "Kem",
              "Nâu",
              "Be",
            ].map((color) => {
              const COLOR_HEX_MAP: Record<string, string> = {
                Đen: "#171717",
                Trắng: "#FFFFFF",
                Đỏ: "#991B1B",
                Nâu: "#78350F",
                Be: "#D4B996",
                Xám: "#6B7280",
                Kem: "#FEFCE8",
                Xanh: "#1E40AF",
                Vàng: "#EAB308",
              };
              const isSelected = selectedColor === color;
              const hexValue = COLOR_HEX_MAP[color] || "#000000";

              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(isSelected ? "" : color)}
                  className={`w-8 h-8 rounded-full border-2 transition-all relative group ${
                    isSelected
                      ? "border-blue-600 scale-110 shadow-md"
                      : "border-transparent hover:border-gray-300"
                  }`}
                  style={{ backgroundColor: hexValue }}
                  title={color}
                >
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${color === "Trắng" || color === "Kem" ? "bg-gray-900" : "bg-white"}`}
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Lọc theo Giá */}
        <div>
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-[0.2em] mb-5">
            Khoảng giá (VNĐ)
          </h3>
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Từ"
                value={
                  localMin
                    ? new Intl.NumberFormat("vi-VN").format(Number(localMin))
                    : ""
                }
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/\D/g, "");
                  setLocalMin(rawValue);
                }}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-medium"
              />
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Đến"
                value={
                  localMax
                    ? new Intl.NumberFormat("vi-VN").format(Number(localMax))
                    : ""
                }
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/\D/g, "");
                  setLocalMax(rawValue);
                }}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-medium"
              />
            </div>
          </div>
        </div>
      </form>

      {/* Footer Buttons */}
      <div className="mt-12 space-y-3 border-t border-gray-100 pt-8">
        <button
          type="button"
          onClick={onClear}
          className="w-full bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-gray-200 transition-all active:scale-95"
        >
          Xóa tất cả bộ lọc
        </button>
      </div>
    </div>
  );
};

export default FilterSidebar;
