"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  ImageIcon,
  ArrowLeft,
  RotateCcw,
} from "lucide-react";
import Image from "next/image";
import { apiRequest } from "@/services/app";

const PRODUCTS_PER_PAGE = 5;

interface ProductVariant {
  color: string;
  size: string;
  quantity: number;
}

interface Product {
  id: number;
  name: string;
  brand?: string;
  brandId: string | number;
  image: string;
  sellPrice: number;
  category?: string;
  categoryId: string | number;
  status: string;
  description: string;
  discountPercentage: number;
  variants: ProductVariant[];
}

interface Brand {
  id: number | string;
  name: string;
}

interface Category {
  id: number | string;
  name: string;
}

export default function AdminProductsPage() {
  // 1. STATE DỮ LIỆU & LOADING
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 2. STATES TÌM KIẾM
  const [searchName, setSearchName] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [appliedFilters, setAppliedFilters] = useState({
    name: "",
    category: "all",
  });

  // 3. STATES PHÂN TRANG & MODAL
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");

  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [currentProduct, setCurrentProduct] = useState<Product>({
    id: 0,
    name: "",
    brandId: "",
    image: "",
    sellPrice: 0,
    categoryId: "",
    status: "visible",
    description: "",
    discountPercentage: 0,
    variants: [],
  });

  // Fetch Brands and Categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const brandRes = await apiRequest("/api/brands?page_size=100");
        const brandData = await brandRes.json();
        if (brandData.code === 200) setBrands(brandData.result.content);

        const catRes = await apiRequest("/api/categories");
        const catData = await catRes.json();
        if (catData.code === 200) setCategories(catData.result.content);
      } catch (error) {
        console.error("Error fetching admin data:", error);
      }
    };
    fetchData();
  }, []);

  // TOAST THÔNG BÁO
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const [totalProducts, setTotalProducts] = useState(0);

  // ==========================================
  // HÀM GỌI API LẤY DỮ LIỆU
  // ==========================================
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {
        page_no: (currentPage - 1).toString(),
        page_size: PRODUCTS_PER_PAGE.toString(),
      };

      if (appliedFilters.name) params.name = appliedFilters.name;
      if (appliedFilters.category && appliedFilters.category !== "all") {
        params.category_id = appliedFilters.category;
      }

      const query = new URLSearchParams(params).toString();
      const response = await apiRequest(`/api/products?${query}`);
      const result = await response.json();
      // console.log(result.result.content);
      if (result.code === 200 && result.result) {
        setProducts(
          result.result.content.map(
            (p: {
              id: number;
              name: string;
              brand?: { name: string; id: number };
              imageUrl?: string;
              price: number;
              category?: { name: string; id: number };
              deleted: number;
              description: string;
              discountPercentage?: number;
              variants?: unknown[];
            }) => ({
              id: p.id,
              name: p.name,
              brand: p.brand?.name || "N/A",
              brandId: p.brand?.id ? String(p.brand.id) : "",
              image:
                p.imageUrl ||
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400",
              sellPrice: p.price,
              category: p.category?.name || "Khác",
              categoryId: p.category?.id ? String(p.category.id) : "",
              status: p.deleted === 0 ? "visible" : "hidden",
              description: p.description,
              discountPercentage: p.discountPercentage || 0,
              variants: p.variants || [],
            }),
          ),
        );
        // console.log(products);
        setTotalProducts(result.result.total);
      }
    } catch {
      showToast("Lỗi kết nối máy chủ!", "error");
    } finally {
      setIsLoading(false);
    }
  }, [appliedFilters, currentPage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // HÀNH ĐỘNG TÌM KIẾM
  const handleSearchClick = () => {
    setCurrentPage(1);
    setAppliedFilters({ name: searchName, category: filterCategory });
  };

  // ==========================================
  // HÀM GỌI API THÊM/SỬA/XÓA
  // ==========================================
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const url = "/api/products";
      const method = modalMode === "add" ? "POST" : "PUT";

      const payload = {
        id: currentProduct.id || null,
        name: currentProduct.name,
        price: currentProduct.sellPrice,
        description: currentProduct.description,
        imageUrl: currentProduct.image,
        quantity:
          currentProduct.variants.reduce((acc, v) => acc + v.quantity, 0) || 0,
        brand_id: Number(currentProduct.brandId),
        category_id: Number(currentProduct.categoryId),
        deleted: currentProduct.status === "visible" ? 0 : 1,
        discountPercentage: currentProduct.discountPercentage,
        variants: currentProduct.variants,
      };

      const response = await apiRequest(url, method, payload);
      const result = await response.json();

      if (result.code === 200) {
        showToast(
          modalMode === "add" ? "Thêm thành công" : "Cập nhật thành công",
          "success",
        );
        fetchProducts();
      } else {
        showToast(result.message || "Lỗi khi lưu", "error");
      }
    } catch {
      showToast("Lỗi hệ thống!", "error");
    } finally {
      setIsLoading(false);
      setIsModalOpen(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Bạn có chắc muốn xóa sản phẩm "${name}" không?`)) {
      setIsLoading(true);
      try {
        const response = await apiRequest(`/api/products/${id}`, "DELETE");
        const result = await response.json();
        if (result.code === 200) {
          showToast("Xóa thành công", "success");
          fetchProducts();
        }
      } catch {
        showToast("Lỗi khi xóa!", "error");
        setIsLoading(false);
      }
    }
  };

  const handleRestore = async (product: any) => {
    if (window.confirm(`Bạn có chắc muốn khôi phục sản phẩm "${product.name}" không?`)) {
      setIsLoading(true);
      try {
        if(product.status === "hidden") {
          product.deleted = 0;
        }
        product.category_id = Number(product.categoryId);
        product.brand_id = Number(product.brandId);
        product.price = product.sellPrice;
        product.id = Number(product.id);

        // console.log("Payload khôi phục:", product);

        const response = await apiRequest(`/api/products`, "PUT",  product );
        const result = await response.json();
        if (result.code === 200) {
          showToast("Khôi phục thành công", "success");
          fetchProducts();
        }
      } catch {
        showToast("Lỗi khi khôi phục!", "error");
        setIsLoading(false);
      }
    }
  };

  const handleOpenAdd = () => {
    setModalMode("add");
    setCurrentProduct({
      id: 0,
      name: "",
      brandId: brands[0]?.id || "",
      image: "",
      sellPrice: 0,
      categoryId: categories[0]?.id || "",
      status: "visible",
      description: "",
      discountPercentage: 0,
      variants: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setModalMode("edit");
    setCurrentProduct({
      ...prod,
      variants: prod.variants || [],
    });
    setIsModalOpen(true);
  };

  // PHÂN TRANG
  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;

  // FORMAT TIỀN TỆ
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN").format(price) + " đ";

  return (
    <div className="relative min-h-[80vh] font-sans pb-10">
      {/* THÔNG BÁO TOAST */}
      {toastMsg && (
        <div
          className={`fixed top-6 right-6 bg-white border-l-4 shadow-xl px-6 py-4 rounded-lg flex items-center gap-3 z-[60] animate-in slide-in-from-right-8 ${toastType === "success" ? "border-green-500" : "border-red-500"}`}
        >
          {toastType === "success" ? (
            <CheckCircle2 className="text-green-500" size={24} />
          ) : (
            <XCircle className="text-red-500" size={24} />
          )}
          <span className="font-medium text-gray-800">{toastMsg}</span>
        </div>
      )}

      {/* ================= MODAL THÊM / SỬA (CHIA 2 CỘT NHƯ HÌNH) ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-5xl my-4 flex flex-col gap-0 animate-in zoom-in-95 max-h-[90vh] overflow-hidden rounded-xl shadow-2xl">
            {/* Header cố định */}
            <div className="bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
              <h2 className="text-lg font-bold text-blue-600 border-l-4 border-blue-600 pl-3">
                {modalMode === "add"
                  ? "Thêm sản phẩm mới"
                  : "Cập nhật sản phẩm"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-red-500 transition p-1 rounded-full"
              >
                <X size={24} />
              </button>
            </div>

            {/* Body có thể cuộn */}
            <div className="bg-white p-8 overflow-y-auto">
              <div className="mb-6 border-b pb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Thông tin sản phẩm
                </h3>
                <p className="text-sm text-gray-500">
                  Cập nhật các thông tin cơ bản của giày
                </p>
              </div>

              <form onSubmit={handleSaveProduct}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  {/* CỘT TRÁI: ĐIỀN CHỮ (Chiếm 2 phần) */}
                  <div className="lg:col-span-2 space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Tên sản phẩm <span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        type="text"
                        value={currentProduct.name}
                        onChange={(e) =>
                          setCurrentProduct({
                            ...currentProduct,
                            name: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none font-medium text-gray-900"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          Thương hiệu <span className="text-red-500">*</span>
                        </label>
                        <select
                          required
                          value={currentProduct.brandId}
                          onChange={(e) =>
                            setCurrentProduct({
                              ...currentProduct,
                              brandId: e.target.value,
                            })
                          }
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none bg-white font-medium text-gray-900"
                        >
                          <option value="">Chọn thương hiệu</option>
                          {brands.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          Danh mục <span className="text-red-500">*</span>
                        </label>
                        <select
                          required
                          value={currentProduct.categoryId}
                          onChange={(e) =>
                            setCurrentProduct({
                              ...currentProduct,
                              categoryId: e.target.value,
                            })
                          }
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none bg-white font-medium text-gray-900"
                        >
                          <option value="">Chọn danh mục</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          Giá bán (VNĐ) <span className="text-red-500">*</span>
                        </label>
                        <input
                          required
                          type="text"
                          value={
                            currentProduct.sellPrice
                              ? currentProduct.sellPrice.toLocaleString("vi-VN")
                              : ""
                          }
                          onChange={(e) => {
                            // Loại bỏ mọi ký tự không phải là số (chặn nhập chữ, chặn dấu trừ)
                            const rawValue = e.target.value.replace(/\D/g, "");
                            setCurrentProduct({
                              ...currentProduct,
                              sellPrice: rawValue ? Number(rawValue) : 0,
                            });
                          }}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none font-medium text-gray-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          Trạng thái <span className="text-red-500">*</span>
                        </label>
                        <select
                          required
                          value={currentProduct.status}
                          onChange={(e) =>
                            setCurrentProduct({
                              ...currentProduct,
                              status: e.target.value,
                            })
                          }
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none bg-white font-medium text-gray-900"
                        >
                          <option value="visible">Hiển thị</option>
                          <option value="hidden">Ẩn</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          Mô tả sản phẩm
                        </label>
                        <textarea
                          rows={2}
                          value={currentProduct.description}
                          onChange={(e) =>
                            setCurrentProduct({
                              ...currentProduct,
                              description: e.target.value,
                            })
                          }
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none resize-none font-medium text-gray-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5 mt-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          Giảm giá (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={currentProduct.discountPercentage}
                          onChange={(e) => {
                            let val = Number(e.target.value);
                            // Ràng buộc không cho phép nhỏ hơn 0 và không lớn hơn 100
                            if (val < 0) val = 0;
                            if (val > 100) val = 100;

                            setCurrentProduct({
                              ...currentProduct,
                              discountPercentage: val,
                            });
                          }}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none font-medium text-gray-900"
                        />
                      </div>
                    </div>

                    {/* BIẾN THỂ (MÀU/SIZE/SỐ LƯỢNG) */}
                    <div className="border-t pt-5">
                      <div className="flex justify-between items-center mb-4">
                        <label className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                          Quản lý biến thể (Màu sắc & Size)
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setCurrentProduct({
                              ...currentProduct,
                              variants: [
                                ...currentProduct.variants,
                                { color: "Trắng", size: "40", quantity: 10 },
                              ],
                            })
                          }
                          className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5"
                        >
                          <Plus size={14} /> Thêm biến thể
                        </button>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        {currentProduct.variants.length > 0 ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-12 gap-3 px-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                              <div className="col-span-4">Màu sắc</div>
                              <div className="col-span-3">Kích thước</div>
                              <div className="col-span-4">Số lượng</div>
                              <div className="col-span-1"></div>
                            </div>
                            {currentProduct.variants.map((v, idx) => (
                              <div
                                key={idx}
                                className="grid grid-cols-12 gap-3 items-center bg-white p-2 rounded-lg border border-gray-200 shadow-sm animate-in fade-in slide-in-from-top-1"
                              >
                                <div className="col-span-4">
                                  <input
                                    required
                                    type="text"
                                    value={v.color}
                                    onChange={(e) => {
                                      const newVariants = [
                                        ...currentProduct.variants,
                                      ];
                                      newVariants[idx].color = e.target.value;
                                      setCurrentProduct({
                                        ...currentProduct,
                                        variants: newVariants,
                                      });
                                    }}
                                    placeholder="Vd: Đen"
                                    className="w-full border-none focus:ring-0 text-sm font-medium p-1 text-gray-900"
                                  />
                                </div>
                                <div className="col-span-3">
                                  <input
                                    required
                                    type="text"
                                    value={v.size}
                                    onChange={(e) => {
                                      const newVariants = [
                                        ...currentProduct.variants,
                                      ];
                                      newVariants[idx].size = e.target.value;
                                      setCurrentProduct({
                                        ...currentProduct,
                                        variants: newVariants,
                                      });
                                    }}
                                    placeholder="40"
                                    className="w-full border-none focus:ring-0 text-sm font-medium p-1 text-gray-900"
                                  />
                                </div>
                                <div className="col-span-4">
                                  <input
                                    required
                                    type="number"
                                    value={v.quantity}
                                    onChange={(e) => {
                                      const newVariants = [
                                        ...currentProduct.variants,
                                      ];
                                      newVariants[idx].quantity = Number(
                                        e.target.value,
                                      );
                                      setCurrentProduct({
                                        ...currentProduct,
                                        variants: newVariants,
                                      });
                                    }}
                                    className="w-full border-none focus:ring-0 text-sm font-bold text-blue-600 p-1"
                                  />
                                </div>
                                <div className="col-span-1 flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newVariants =
                                        currentProduct.variants.filter(
                                          (_, i) => i !== idx,
                                        );
                                      setCurrentProduct({
                                        ...currentProduct,
                                        variants: newVariants,
                                      });
                                    }}
                                    className="text-gray-300 hover:text-red-500 transition"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <p className="text-xs text-gray-400 italic">
                              Chưa có biến thể nào. Vui lòng thêm để quản lý kho
                              theo màu/size.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* CỘT PHẢI: ẢNH (Chiếm 1 phần) */}
                  <div className="lg:col-span-1 flex flex-col items-center">
                    <label className="block text-sm font-semibold text-gray-800 mb-4 w-full text-center">
                      Hình ảnh sản phẩm
                    </label>

                    <div className="w-full aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center bg-gray-50 overflow-hidden relative group">
                      {currentProduct.image ? (
                        <Image
                          src={currentProduct.image}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="text-gray-400 flex flex-col items-center">
                          <ImageIcon size={48} className="mb-2 opacity-50" />
                          <span>Chưa có ảnh</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <span className="text-white font-medium text-sm">
                          Bấm nút bên dưới để đổi
                        </span>
                      </div>
                    </div>

                    {/* KHUNG CHỨA NÚT VÀ INPUT FILE (ẨN) */}
                    <div className="w-full relative mt-4">
                      {/* Thẻ input ẩn đi */}
                      <input
                        type="file"
                        accept="image/*"
                        id="imageUpload"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // Tạo một URL tạm thời (blob URL) để preview ảnh vừa chọn ngay lập tức
                            const imageUrl = URL.createObjectURL(file);
                            setCurrentProduct({
                              ...currentProduct,
                              image: imageUrl,
                            });
                          }
                        }}
                      />
                      {/* Label này đóng vai trò như một nút bấm, khi click vào nó sẽ kích hoạt thẻ input ẩn bên trên */}
                      <label
                        htmlFor="imageUpload"
                        className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition"
                      >
                        <Edit size={16} /> Thay đổi hình ảnh
                      </label>
                    </div>

                    <p className="text-xs text-gray-500 mt-3 text-center font-medium">
                      Hỗ trợ JPG, PNG, WEBP. Kích thước tối đa 5MB.
                    </p>
                  </div>
                </div>

                {/* NÚT LƯU Ở DƯỚI CÙNG */}
                <div className="pt-8 flex justify-end gap-4 border-t border-gray-100 mt-8 pb-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-semibold transition flex items-center gap-2 font-medium"
                  >
                    <ArrowLeft size={18} /> Quay về
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-md font-semibold transition flex items-center gap-2 font-medium"
                  >
                    {modalMode === "add" ? (
                      <Plus size={18} />
                    ) : (
                      <CheckCircle2 size={18} />
                    )}
                    {modalMode === "add" ? "Thêm sản phẩm" : "Lưu thay đổi"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- TIÊU ĐỀ & NÚT THÊM SẢN PHẨM --- */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600 uppercase">
          Quản lý sản phẩm
        </h1>
        <button
          onClick={handleOpenAdd}
          className="bg-[#F97316] text-white px-5 py-2.5 rounded-lg shadow-sm hover:bg-[#EA580C] transition flex items-center gap-2 font-medium"
        >
          <Plus size={18} /> Thêm sản phẩm
        </button>
      </div>

      {/* --- BỘ LỌC TÌM KIẾM --- */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1.5">
              Tìm theo tên
            </label>
            <input
              type="text"
              placeholder="Nhập tên giày..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full border-2 border-gray-300 text-gray-900 placeholder-gray-400 rounded-lg px-4 py-2.5 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none shadow-sm transition-all font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1.5">
              Tìm theo danh mục
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full border-2 border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none shadow-sm transition-all bg-white font-medium"
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <button
              onClick={handleSearchClick}
              className="bg-[#22C55E] text-white px-6 py-2.5 rounded-lg shadow-sm hover:bg-[#16A34A] transition flex items-center justify-center gap-2 font-bold w-full md:w-auto font-medium text-gray-900"
            >
              <Search size={18} /> Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      {/* --- BẢNG DỮ LIỆU CÓ HIỆU ỨNG LOADING --- */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8 min-h-[400px] relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center backdrop-blur-[1px]">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <span className="font-semibold text-gray-600">
                Đang tải dữ liệu...
              </span>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-blue-600 text-white text-sm font-semibold uppercase tracking-wide">
                <th className="px-4 py-4 whitespace-nowrap">STT</th>
                <th className="px-4 py-4 whitespace-nowrap text-left">
                  TÊN SẢN PHẨM
                </th>
                <th className="px-4 py-4 whitespace-nowrap">HÌNH ẢNH</th>
                <th className="px-4 py-4 whitespace-nowrap">GIÁ BÁN</th>
                <th className="px-4 py-4 whitespace-nowrap">DANH MỤC</th>
                <th className="px-4 py-4 whitespace-nowrap">TRẠNG THÁI</th>
                <th className="px-4 py-4 whitespace-nowrap">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm text-slate-900">
              {!isLoading && products.length > 0
                ? products.map((prod, index) => (
                    <tr
                      key={prod.id}
                      className="hover:bg-blue-50/50 transition-colors"
                    >
                      <td className="px-4 py-4 font-medium text-slate-700">
                        {startIndex + index + 1}
                      </td>
                      <td className="px-4 py-4 text-left">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 text-base">
                            {prod.name}
                          </span>
                          <span className="text-gray-500 text-xs mt-1 font-medium">
                            Thương hiệu:{" "}
                            <span className="font-bold text-slate-700">
                              {prod.brand}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 flex justify-center">
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                          <Image
                            src={prod.image}
                            alt={prod.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-4 font-bold text-red-600">
                        {formatPrice(prod.sellPrice)}
                      </td>
                      <td className="px-4 py-4">
                        <span className="bg-gray-100 text-slate-800 px-3 py-1.5 rounded-full text-xs font-medium border border-gray-300">
                          {prod.category}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {prod.status === "visible" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-green-800 border border-green-300 bg-green-50 text-xs font-medium">
                            <CheckCircle2 size={14} /> Bình thường
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-slate-600 border border-gray-300 bg-gray-100 text-xs font-medium">
                            <XCircle size={14} /> Đã xóa
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-center items-center gap-2">
                          {prod.status === "visible" ? (
                            // Nếu visible: hiển thị cả Sửa và Xóa
                            <>
                              <button
                                onClick={() => handleOpenEdit(prod)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded shadow-sm transition font-medium flex items-center gap-1.5"
                              >
                                <Edit size={16} /> Sửa
                              </button>
                              <button
                                onClick={() => handleDelete(prod.id, prod.name)}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded shadow-sm transition font-medium flex items-center gap-1.5"
                              >
                                <Trash2 size={16} /> Xóa
                              </button>
                            </>
                          ) : (
                            // Nếu hidden: chỉ hiển thị nút Khôi phục (thay thế nút Xóa)
                            <button
                              onClick={() => handleRestore(prod)}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded shadow-sm transition font-medium flex items-center gap-1.5"
                            >
                              <RotateCcw size={16} /> Khôi phục
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                : !isLoading && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-12 text-center text-slate-500 font-medium"
                      >
                        Không tìm thấy sản phẩm nào.
                      </td>
                    </tr>
                  )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- PHÂN TRANG --- */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`w-9 h-9 flex items-center justify-center border rounded-lg transition ${currentPage === 1 ? "border-gray-200 text-gray-300 cursor-not-allowed bg-white" : "border-gray-300 text-gray-500 bg-white hover:bg-blue-50 hover:text-blue-600 shadow-sm"}`}
          >
            <ChevronLeft size={18} />
          </button>
          {Array.from({ length: totalPages }).map((_, index) => {
            const pageNumber = index + 1;
            return (
              <button
                key={pageNumber}
                onClick={() => setCurrentPage(pageNumber)}
                className={`w-9 h-9 flex items-center justify-center border rounded-lg font-bold transition shadow-sm ${currentPage === pageNumber ? "border-blue-600 bg-blue-600 text-white shadow-md" : "border-gray-300 bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600"}`}
              >
                {pageNumber}
              </button>
            );
          })}
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className={`w-9 h-9 flex items-center justify-center border rounded-lg transition ${currentPage === totalPages ? "border-gray-200 text-gray-300 cursor-not-allowed bg-white" : "border-gray-300 text-gray-500 bg-white hover:bg-blue-50 hover:text-blue-600 shadow-sm"}`}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
