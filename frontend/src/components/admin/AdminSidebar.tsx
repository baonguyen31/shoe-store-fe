"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart3,
  Users, 
  ShoppingCart, 
  Package, 
  LogOut,
  User
} from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const [userName, setUserName] = useState<string>("Admin");

  useEffect(() => {
    const updateAuth = async () => {
      let name = sessionStorage.getItem("customerName");
      let token = sessionStorage.getItem("token");
      
      // Làm sạch token
      if (token) {
        token = token.replace(/^["'](.+)["']$/, '$1').trim();
      }

      if (!name && token) {
        try {
          const res = await fetch("http://localhost:8080/api/auth/me", {
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.code === 200) {
              name = data.result.fullName;
              sessionStorage.setItem("customerName", name || "");
              sessionStorage.setItem("customerEmail", data.result.email || "");
            }
          }
        } catch (err) {
          console.error("Admin auto fetch failed", err);
        }
      }
      if (name) setUserName(name);
    };
    updateAuth();
    window.addEventListener("authUpdated", updateAuth);
    return () => window.removeEventListener("authUpdated", updateAuth);
  }, []);

  // Danh sách menu dựa theo hình ảnh (đã bỏ Quản lý danh mục)
  const menuItems = [
     { name: 'Thống kê & báo cáo', href: '/admin/dashboard', icon: BarChart3},
    { name: 'Quản lý người dùng', href: '/admin/users', icon: Users },
    { name: 'Quản lý đơn hàng', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Quản lý sản phẩm', href: '/admin/products', icon: Package },
  ];

  return (
    <div className="w-64 bg-[#2A2A2E] text-white flex flex-col h-screen fixed top-0 left-0 border-r border-gray-800">
      {/* Tiêu đề */}
      <div className="h-20 flex items-center justify-center border-b border-gray-700/50">
        <h1 className="text-lg font-bold tracking-wide text-white">
          TRUNG TÂM ĐIỀU KHIỂN
        </h1>
      </div>

      {/* Danh sách Menu */}
      <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          // Kiểm tra xem URL hiện tại có khớp với href của menu không
          const isActive = pathname.startsWith(item.href);
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-4 px-6 py-4 transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white rounded-r-lg mx-2 my-1' // Màu hồng giống thiết kế
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white mx-2 rounded-lg my-1'
              }`}
            >
              <Icon size={20} className={isActive ? "text-white" : "text-gray-400"} />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Profile & Đăng xuất */}
      <div className="p-4 border-t border-gray-700/50 bg-[#242428]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gray-700 text-gray-300 p-2 rounded-full">
              <User size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white">{userName}</span>
              <span className="text-xs text-gray-400">Online</span>
            </div>
          </div>
          <Link href="/" className="text-gray-400 hover:text-[#E84379] p-2 rounded-lg transition-colors" title="Đăng xuất">
            <LogOut size={20} />
          </Link>
        </div>
      </div>
      
    </div>
  );
}
