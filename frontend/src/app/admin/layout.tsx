"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { apiRequest } from "@/services/app";
import { Menu } from "lucide-react"; // Bổ sung icon Menu cho Mobile

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- THÊM STATE ĐIỀU KHIỂN MENU MOBILE ---
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Tự động đóng menu trên mobile nếu người dùng chuyển trang
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    // Skip check for admin login page
    if (pathname === "/admin/login") {
      setIsLoading(false);
      return;
    }

    const checkAuth = async () => {
      try {
        const response = await apiRequest("/api/auth/me", "GET");
        if (response.ok) {
          const res = await response.json();
          // Backend returns role in res.result.role
          if (res.result && res.result.role === "STAFF") {
            setIsAuthorized(true);
            if (res.result.fullName) {
              sessionStorage.setItem("customerName", res.result.fullName);
            }
          } else {
            // Not a staff member, redirect to admin login
            router.push("/admin/login");
          }
        } else {
          // Not authenticated, redirect to admin login
          router.push("/admin/login");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/admin/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-500 font-medium">
            Đang kiểm tra quyền truy cập...
          </p>
        </div>
      </div>
    );
  }

  // If on login page, just show the login form
  if (pathname === "/admin/login") {
    return <div className="min-h-screen bg-gray-50 font-sans">{children}</div>;
  }

  // If not authorized, don't show anything (router will redirect)
  if (!isAuthorized) {
    return null;
  }

  // Authorized: Show admin dashboard with sidebar
  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* 1. LỚP PHỦ NỀN ĐEN KHI MỞ MENU TRÊN MOBILE */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* 2. CỘT TRÁI: THANH MENU (ĐÃ ĐƯỢC BỌC RESPONSIVE) */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <AdminSidebar />
      </div>

      {/* 3. CỘT PHẢI: NỘI DUNG CHÍNH */}
      {/* lg:ml-64: Chỉ căn lề trái 256px khi ở màn hình Laptop trở lên */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64 transition-all duration-300">
        {/* HEADER ĐIỆN THOẠI (Chỉ xuất hiện trên màn hình nhỏ) */}
        <header className="bg-white border-b border-gray-200 p-4 flex items-center lg:hidden sticky top-0 z-30 shadow-sm">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="text-gray-700 hover:text-blue-600 focus:outline-none p-1 -ml-1 rounded-md active:bg-gray-100"
          >
            <Menu size={28} />
          </button>
          <span className="ml-3 font-bold text-gray-800 uppercase tracking-wide">
            Hệ thống quản trị
          </span>
        </header>

        {/* NỘI DUNG TRANG (Orders, Products, Dashboard...) */}
        {/* Giảm padding trên điện thoại (p-4), giữ nguyên padding to (p-8) trên Laptop */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
