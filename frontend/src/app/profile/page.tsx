"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Edit, CheckCircle2, Loader2, Lock, Eye, EyeOff, MapPin } from 'lucide-react';
import Navbar from '@/components/Navbar';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  // 1. STATE QUẢN LÝ DỮ LIỆU
  const [userInfo, setUserInfo] = useState({
    id: "",
    fullName: "",
    email: "",
    phone: "",
    city: "",
    ward: "",
    street: "",
    dateOfBirth: "",
    status: 1 // Lưu status để gửi trả lại BE khi update
  });

  const [editForm, setEditForm] = useState(userInfo);
  const [passwords, setPasswords] = useState({ newPassword: "", confirmPassword: "" });
  const [showPass, setShowPass] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");  // ← THÊM STATE NÀY

  // const [toast, setToast] = useState("");

  // 2. FETCH DỮ LIỆU TỪ DATABASE
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        let token = sessionStorage.getItem("token");
        
        // Làm sạch token (loại bỏ dấu ngoặc kép nếu có)
        if (token) {
          token = token.replace(/^["'](.+)["']$/, '$1').trim();
        }

        const response = await fetch(`http://localhost:8080/api/auth/me`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
          const result = await response.json();
          const data = result.result || result;
          
          const profileData = {
            id: data.id,
            fullName: data.fullName || "",
            email: data.email || "",
            phone: data.phone || "",
            city: data.city || "",
            ward: data.ward || "",
            street: data.street || "",
            dateOfBirth: data.dateOfBirth || "",
            status: data.status ?? 1
          };

          setUserInfo(profileData);
          setEditForm(profileData);
          if (data.fullName) {
            sessionStorage.setItem("customerName", data.fullName);
            window.dispatchEvent(new Event("authUpdated"));
          }
        }
      } catch (error) {
        console.error("Lỗi khi tải thông tin:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  
  const handleSave = async () => {
  // 1. Kiểm tra logic mật khẩu phía Client trước
  if (passwords.newPassword !== "") {
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }
  }

  setIsSaving(true);
  try {
    let token = sessionStorage.getItem("token");
    
    // Làm sạch token
    if (token) {
      token = token.replace(/^["'](.+)["']$/, '$1').trim();
    }
    
    // 2. Chuẩn be Payload gửi lên
    // Quan trọng: Gửi kèm 'password' nếu người dùng có nhập vào ô đổi mật khẩu
    const updateData: Record<string, unknown> = {
      ...editForm,
      username: editForm.email,
      status: userInfo.status,
    };

    if (passwords.newPassword !== "") {
      updateData.password = passwords.newPassword;
    }

    const response = await fetch(`http://localhost:8080/api/customers/${userInfo.id}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updateData)
    });

    if (response.ok) {
      setUserInfo(editForm);
      setPasswords({ newPassword: "", confirmPassword: "" });
      sessionStorage.setItem("customerName", editForm.fullName);
      window.dispatchEvent(new Event("authUpdated"));
      setIsEditing(false);
      
      // Hiển thị message và tự động ẩn sau 3 giây
      setSuccessMessage("Cập nhật thông tin thành công!");
      toast.success("Cập nhật thông tin thành công!");

      setTimeout(() => setSuccessMessage(""), 3000);
    } else {
      const errorMsg = await response.text();
      toast.error("Lỗi: " + errorMsg);
    }
  } catch {
    toast.error("Lỗi kết nối máy chủ!");
  } finally {
    setIsSaving(false);
  }
};

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F6F9]">
        <Loader2 className="animate-spin text-[#FA5C52]" size={40} />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F4F6F9] pt-24 pb-12 font-sans relative">
      <Navbar />
      
      {successMessage && (  // ← THAY ĐỔI ĐÂY
        <div className="fixed top-24 right-6 bg-white border-l-4 border-green-500 shadow-xl px-6 py-4 rounded-lg flex items-center gap-3 z-50 animate-in slide-in-from-right-8">
          <CheckCircle2 className="text-green-500" size={24} />
          <span className="font-medium text-gray-800">{successMessage}</span>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4">
        <div className="text-sm font-medium mb-6 flex items-center gap-1.5">
          <Link href="/" className="text-[#FA5C52] hover:underline">Trang chủ</Link> 
          <span className="text-gray-500">/</span> 
          <span className="text-gray-600">Tài khoản</span>
        </div>

        <div className="bg-white border border-gray-200 shadow-sm p-8 md:p-10">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Thông Tin Tài Khoản</h1>
            <div className="h-[2px] w-full bg-[#FA5C52] opacity-80"></div>
          </div>

          {!isEditing ? (
            <>
              <div className="w-full border border-gray-200 rounded-sm overflow-hidden mb-6">
                <table className="w-full text-left text-sm md:text-base">
                  <tbody className="divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="w-1/3 py-4 px-6 font-bold text-gray-800 bg-gray-50/50">Họ và tên</td>
                      <td className="w-2/3 py-4 px-6 text-gray-700 font-medium">{userInfo.fullName}</td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="w-1/3 py-4 px-6 font-bold text-gray-800 bg-gray-50/50">Email / Tên đăng nhập</td>
                      <td className="w-2/3 py-4 px-6 text-gray-700 font-medium">{userInfo.email}</td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="w-1/3 py-4 px-6 font-bold text-gray-800 bg-gray-50/50">Số điện thoại</td>
                      <td className="w-2/3 py-4 px-6 text-gray-700 font-medium">{userInfo.phone}</td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="w-1/3 py-4 px-6 font-bold text-gray-800 bg-gray-50/50">Ngày sinh</td>
                      <td className="w-2/3 py-4 px-6 text-gray-700 font-medium">{userInfo.dateOfBirth }</td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="w-1/3 py-4 px-6 font-bold text-gray-800 bg-gray-50/50">Địa chỉ</td>
                      <td className="w-2/3 py-4 px-6 text-gray-700 font-medium">
                        {userInfo.street ? `${userInfo.street}, ${userInfo.ward}, ${userInfo.city}` : "Chưa cập nhật"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end">
                <button 
                  onClick={() => setIsEditing(true)}
                  className="bg-[#FA5C52] hover:bg-[#E04A41] text-white px-6 py-2.5 rounded shadow-sm font-semibold text-sm flex items-center gap-2 transition-all"
                >
                  <Edit size={16} /> Chỉnh sửa thông tin
                </button>
              </div>
            </>
          ) : (
            <div className="mt-8 p-6 lg:p-8 bg-gray-50 border border-gray-200 rounded animate-in fade-in slide-in-from-top-4">
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Edit size={20} className="text-[#FA5C52]"/> Cập nhật thông tin
              </h3>
              
              <div className="space-y-5 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Họ và tên</label>
                    <input type="text" value={editForm.fullName} onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                      className="w-full border border-gray-300 rounded px-4 py-2.5 outline-none focus:border-[#FA5C52] focus:ring-1 focus:ring-[#FA5C52] bg-white text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Số điện thoại</label>
                    <input type="text" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                      className="w-full border border-gray-300 rounded px-4 py-2.5 outline-none focus:border-[#FA5C52] focus:ring-1 focus:ring-[#FA5C52] bg-white text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Email / Username (Cố định)</label>
                    <input type="email" disabled value={editForm.email} className="w-full border border-gray-200 rounded px-4 py-2.5 bg-gray-100 text-gray-500 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Ngày sinh</label>
                    <input type="date" value={editForm.dateOfBirth} onChange={(e) => setEditForm({...editForm, dateOfBirth: e.target.value})}
                      className="w-full border border-gray-300 rounded px-4 py-2.5 outline-none focus:border-[#FA5C52] focus:ring-1 focus:ring-[#FA5C52] bg-white text-gray-900" />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <label className="flex items-center gap-2 text-xs font-bold text-[#FA5C52] uppercase mb-4 tracking-widest"><MapPin size={14}/> Địa chỉ giao hàng</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">Tỉnh / Thành phố</label>
                      <input type="text" value={editForm.city} onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-[#FA5C52] bg-white text-gray-900" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">Quận / Huyện</label>
                      <input type="text" value={editForm.ward} onChange={(e) => setEditForm({...editForm, ward: e.target.value})}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-[#FA5C52] bg-white text-gray-900" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">Số nhà, tên đường</label>
                      <input type="text" value={editForm.street} onChange={(e) => setEditForm({...editForm, street: e.target.value})}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-[#FA5C52] bg-white text-gray-900" />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                   <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2"><Lock size={16} /> Đổi mật khẩu (Bỏ trống nếu không đổi)</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="relative">
                        <input type={showPass ? "text" : "password"} placeholder="Mật khẩu mới" 
                          onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                          className="w-full border border-gray-300 rounded px-4 py-2.5 outline-none focus:border-[#FA5C52] bg-white text-gray-900" />
                        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3 text-gray-400">
                          {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                        </button>
                      </div>
                      <input type={showPass ? "text" : "password"} placeholder="Xác nhận mật khẩu mới" 
                        onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                        className="w-full border border-gray-300 rounded px-4 py-2.5 outline-none focus:border-[#FA5C52] bg-white text-gray-900" />
                   </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button onClick={() => { setIsEditing(false); setEditForm(userInfo); }} disabled={isSaving}
                  className="px-6 py-2.5 border border-gray-300 bg-white text-gray-700 rounded font-bold text-sm hover:bg-gray-100 transition shadow-sm">
                  Hủy bỏ
                </button>
                <button onClick={handleSave} disabled={isSaving}
                  className="px-8 py-2.5 bg-[#FA5C52] text-white rounded font-bold text-sm hover:bg-[#E04A41] transition shadow-sm flex items-center gap-2">
                  {isSaving && <Loader2 size={16} className="animate-spin" />} Lưu thay đổi
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
