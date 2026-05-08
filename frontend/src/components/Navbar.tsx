"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Search,
  User,
  Menu,
  X,
  LogOut,
  FileText,
} from "lucide-react";
import { getCartCount } from "@/utils/cartUtils";
import { apiRequest } from "@/services/app";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- STATE CHO TÌM KIẾM ---
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // --- STATE LƯU THÔNG TIN ĐĂNG NHẬP ---
  const [userName, setUserName] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false); // Để fix lỗi Hydration

  const [cartCount, setCartCount] = useState(0);

  // KHI NAVBAR LOAD LÊN, KIỂM TRA XEM CÓ TÊN NGƯỜI DÙNG TRONG LOCAL STORAGE KHÔNG
  useEffect(() => {
    const updateAuth = async () => {
      let storedName = sessionStorage.getItem("customerName");
      let token = sessionStorage.getItem("token");

      // Làm sạch token (loại bỏ dấu ngoặc kép nếu có)
      if (token) {
        token = token.replace(/^["'](.+)["']$/, "$1").trim();
      }

      if (token && token !== "fail") {
        // Luôn xác thực token với Backend để đảm bảo phiên đăng nhập còn hiệu lực
        try {
          const res = await apiRequest("/api/auth/me", "GET");
          if (res.ok) {
            const data = await res.json();
            if (data && data.code === 200 && data.result) {
              storedName = data.result.fullName;
              sessionStorage.setItem("customerName", storedName || "");
              sessionStorage.setItem("customerEmail", data.result.email || "");
              sessionStorage.setItem(
                "customerId",
                data.result.id?.toString() || "",
              );
            }
          } else if (res.status === 401) {
            // Token không hợp lệ, xóa sạch thông tin
            storedName = null;
            sessionStorage.removeItem("customerName");
            sessionStorage.removeItem("token");
          }
        } catch (err) {
          console.error("Session validation failed", err);
        }
      }
      setUserName(storedName);
    };

    updateAuth();

    // Khởi tạo số lượng giỏ hàng
    const fetchCartCount = async () => {
      const count = await getCartCount();
      setCartCount(count);
    };
    fetchCartCount();

    setIsMounted(true); // Đánh dấu đã mount xong trên client

    // Lắng nghe sự kiện cập nhật giỏ hàng và đăng nhập
    const handleCartUpdate = () => {
      fetchCartCount();
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    window.addEventListener("authUpdated", updateAuth);
    window.addEventListener("storage", updateAuth); // Đồng bộ giữa các tab

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
      window.removeEventListener("authUpdated", updateAuth);
      window.removeEventListener("storage", updateAuth);
    };
  }, []);

  // HÀM XỬ LÝ ĐĂNG XUẤT
  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("customerName");
    sessionStorage.removeItem("customerEmail");
    sessionStorage.removeItem("customerId");
    setUserName(null); // Xóa trên giao diện

    // Phát sự kiện để các thành phần khác biết đã đăng xuất
    window.dispatchEvent(new Event("authUpdated"));

    router.push("/");
  };

  // Hàm xử lý khi người dùng bấm Enter hoặc Kính lúp
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() !== "") {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 w-full bg-white shadow-md z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* 1. LOGO */}
        <Link
          href="/"
          className="text-2xl font-bold text-gray-800 flex-shrink-0"
        >
          SHOE<span className="text-blue-600">STORE</span>
        </Link>

        {/* THANH TÌM KIẾM (Desktop) */}
        <div className="hidden md:block flex-1 max-w-md mx-8">
          <form onSubmit={handleSearch} className="relative group">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm tên sản phẩm"
              className="w-full bg-gray-100 border border-transparent text-gray-800 text-sm rounded-full pl-4 pr-12 py-2.5 focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
            />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-full transition-colors"
            >
              <Search size={18} />
            </button>
          </form>
        </div>

        {/* MENU & ICONS */}
        <div className="flex items-center space-x-6">
          <div className="hidden lg:flex space-x-6 text-gray-600 font-medium text-sm">
            <Link href="/search" className="hover:text-blue-600 transition">
              Tất cả sản phẩm
            </Link>
            <Link
              href="/category/nam"
              className="hover:text-blue-600 transition"
            >
              Giày Thể Thao Nam
            </Link>
            <Link
              href="/category/nu"
              className="hover:text-blue-600 transition"
            >
              Giày Thể Thao Nữ
            </Link>
            <Link
              href="/category/cap"
              className="hover:text-blue-600 transition"
            >
              Giày Cặp
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {/* KIỂM TRA ĐĂNG NHẬP ĐỂ HIỂN THỊ TÊN HOẶC NÚT ĐĂNG NHẬP */}
            <div className="relative group cursor-pointer">
              {/* Chỉ render phần phụ thuộc vào sessionStorage/state sau khi đã mounted */}
              {isMounted && userName ? (
                // --- ĐÃ ĐĂNG NHẬP ---
                <div className="flex items-center gap-2 p-2 rounded-full text-gray-700 hover:bg-gray-100 transition">
                  <div className="bg-blue-100 text-blue-600 p-1.5 rounded-full">
                    <User size={18} />
                  </div>
                  <span className="font-bold text-sm hidden md:block max-w-[120px] truncate">
                    {userName}
                  </span>
                </div>
              ) : (
                // --- CHƯA ĐĂNG NHẬP (Hoặc trạng thái mặc định lúc SSR) ---
                <div className="p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition">
                  <User size={24} />
                </div>
              )}

              <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:translate-y-1 transition-all duration-300 z-50">
                <div className="absolute -top-4 left-0 w-full h-4 bg-transparent"></div>
                <div className="py-2 flex flex-col">
                  {isMounted && userName ? (
                    // Menu khi đã đăng nhập
                    <>
                      <div className="px-4 py-2 border-b border-gray-100 md:hidden">
                        <span className="text-sm font-bold text-blue-600">
                          Xin chào, {userName}
                        </span>
                      </div>
                      <Link
                        href="/profile"
                        className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition flex items-center gap-2"
                      >
                        <User size={16} /> Tài khoản của tôi
                      </Link>
                      <Link
                        href="/orders"
                        className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition flex items-center gap-2"
                      >
                        <FileText size={16} /> Lịch sử mua hàng
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition flex items-center gap-2 text-left border-t border-gray-100 mt-1"
                      >
                        <LogOut size={16} /> Đăng xuất
                      </button>
                    </>
                  ) : (
                    // Menu khi chưa đăng nhập
                    <>
                      <Link
                        href="/login"
                        className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                      >
                        Đăng nhập
                      </Link>
                      <Link
                        href="/register"
                        className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                      >
                        Đăng ký
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>

            <Link
              href="/cart"
              className="relative cursor-pointer group"
              title="Giỏ hàng"
            >
              <div className="p-2 rounded-full group-hover:bg-gray-100 transition">
                <ShoppingCart
                  size={24}
                  className="text-gray-600 group-hover:text-blue-600 transition"
                />
              </div>
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              className="lg:hidden text-gray-600"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* MENU MOBILE */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 absolute w-full left-0 px-4 py-4 flex flex-col space-y-4 shadow-lg">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm..."
              className="w-full bg-gray-100 border border-transparent rounded-full pl-4 pr-10 py-2 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
            >
              <Search size={18} />
            </button>
          </form>

          <Link
            href="/"
            className="block py-2 text-gray-700 font-medium hover:text-blue-600 border-b border-gray-50"
          >
            Trang chủ
          </Link>
          <Link
            href="/search"
            className="block py-2 text-gray-700 font-medium hover:text-blue-600 border-b border-gray-50"
          >
            Tất cả sản phẩm
          </Link>
          <Link
            href="/category/nam"
            className="block py-2 text-gray-700 font-medium hover:text-blue-600 border-b border-gray-50"
          >
            Giày Thể Thao Nam
          </Link>
          <Link
            href="/category/nu"
            className="block py-2 text-gray-700 font-medium hover:text-blue-600 border-b border-gray-50"
          >
            Giày Thể Thao Nữ
          </Link>
          <Link
            href="/category/cap"
            className="block py-2 text-gray-700 font-medium hover:text-blue-600 border-b border-gray-50"
          >
            Giày Cặp
          </Link>

          <div className="flex flex-col gap-2 pt-2">
            {isMounted && userName ? (
              <>
                <div className="py-2 text-center text-sm text-gray-500">
                  Đang đăng nhập với:{" "}
                  <span className="font-bold text-blue-600">{userName}</span>
                </div>
                <Link
                  href="/profile"
                  className="w-full text-center bg-gray-100 text-gray-800 py-2.5 rounded-lg font-semibold"
                >
                  Tài khoản của tôi
                </Link>
                <Link
                  href="/orders"
                  className="w-full text-center bg-gray-100 text-gray-800 py-2.5 rounded-lg font-semibold"
                >
                  Lịch sử đơn hàng
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-center bg-red-50 text-red-600 py-2.5 rounded-lg font-bold"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <div className="flex gap-4">
                <Link
                  href="/login"
                  className="flex-1 text-center bg-gray-100 text-gray-800 py-2.5 rounded-lg font-semibold"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="flex-1 text-center bg-blue-600 text-white py-2.5 rounded-lg font-semibold"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
