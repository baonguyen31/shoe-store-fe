'use client';

import React, { useState } from 'react';
import { ArrowRight, ChevronLeft, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '', 
    lastName: '', 
    phone: '',
    dateOfBirth: '',
    // Tách riêng 3 trường địa chỉ theo cấu trúc DB
    city: '',
    ward: '',
    street: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(''); 

    // Kiểm tra khớp Mật khẩu
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp!');
      return;
    }

    setIsLoading(true);

    // Gửi dữ liệu tách riêng từng cột địa chỉ khớp với DB image
    const registerData = {
      username: formData.email, 
      email: formData.email,
      password: formData.password,
      fullName: `${formData.lastName} ${formData.firstName}`.trim(),
      phone: formData.phone,
      dateOfBirth: formData.dateOfBirth,
      city: formData.city,    // Cột city trong DB
      ward: formData.ward,    // Cột ward trong DB
      street: formData.street // Cột street trong DB
    };

    try {
      const res = await fetch("http://localhost:8080/register/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      });

      if (res.ok) {
        toast.success("Chúc mừng! Bạn đã đăng ký thành công.");
        router.push("/login");
      } else {
        const errorMessageFromServer = await res.text();
        setErrorMsg(errorMessageFromServer || "Đăng ký thất bại.");
      }
    } catch {
      setErrorMsg("Lỗi kết nối tới Server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col font-sans pb-12">
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-black text-blue-600 tracking-tighter italic">
            SHOE<span className="text-black">STORE</span>
          </Link>
          <Link href="/login" className="text-sm font-bold text-gray-500 hover:text-blue-600 flex items-center gap-1 transition-colors">
            <ChevronLeft size={16} /> Quay lại Đăng nhập
          </Link>
        </div>
      </nav>
      
      <div className="flex-grow flex items-center justify-center px-4 pt-28">
        <div className="max-w-4xl w-full bg-white rounded-[2rem] shadow-xl shadow-blue-100/20 p-8 md:p-12 border border-gray-100">
          
          <div className="mb-10 border-b border-gray-100 pb-6">
            <h1 className="text-3xl font-bold text-gray-900 tracking-wide uppercase mb-2">
              Tạo tài khoản <span className="text-blue-600">khách hàng</span>
            </h1>
          </div>

          {errorMsg && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600">
              <AlertCircle size={20} />
              <p className="text-sm font-bold">{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              
              {/* CỘT TRÁI */}
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Email *</label>
                  <input 
                    name="email" type="email" required
                    value={formData.email} onChange={handleChange}
                    className="w-full bg-gray-100 border border-gray-300 rounded-xl py-3 px-4 outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Mật khẩu *</label>
                  <div className="relative">
                    <input 
                      name="password" type={showPassword ? "text" : "password"} required
                      value={formData.password} onChange={handleChange}
                      className="w-full bg-gray-100 border border-gray-300 rounded-xl py-3 px-4 outline-none focus:bg-white focus:border-blue-500"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Xác nhận mật khẩu *</label>
                  <input 
                    name="confirmPassword" type={showPassword ? "text" : "password"} required
                    value={formData.confirmPassword} onChange={handleChange}
                    className={`w-full bg-gray-100 border ${errorMsg.includes('Mật khẩu') ? 'border-red-500' : 'border-gray-300'} rounded-xl py-3 px-4 outline-none focus:bg-white focus:border-blue-500`}
                  />
                </div>

                {/* ĐỊA CHỈ TÁCH CỘT */}
                <div className="pt-4 border-t border-gray-100">
                   <p className="text-xs font-black text-blue-600 uppercase mb-4 tracking-widest">Địa chỉ chi tiết</p>
                   <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Tỉnh / Thành (City)</label>
                        <input name="city" required value={formData.city} onChange={handleChange}
                          className="w-full bg-gray-100 border border-gray-300 rounded-lg py-2 px-3 text-sm outline-none focus:bg-white focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Phường / Xã (Ward)</label>
                        <input name="ward" required value={formData.ward} onChange={handleChange}
                          className="w-full bg-gray-100 border border-gray-300 rounded-lg py-2 px-3 text-sm outline-none focus:bg-white focus:border-blue-500" />
                      </div>
                   </div>
                   <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Số nhà, tên đường (Street)</label>
                      <input name="street" required value={formData.street} onChange={handleChange}
                        className="w-full bg-gray-100 border border-gray-300 rounded-lg py-2 px-3 text-sm outline-none focus:bg-white focus:border-blue-500" />
                   </div>
                </div>
              </div>

              {/* CỘT PHẢI */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Họ *</label>
                    <input name="lastName" type="text" required value={formData.lastName} onChange={handleChange}
                      className="w-full bg-gray-100 border border-gray-300 rounded-xl py-3 px-4 outline-none focus:bg-white focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Tên *</label>
                    <input name="firstName" type="text" required value={formData.firstName} onChange={handleChange}
                      className="w-full bg-gray-100 border border-gray-300 rounded-xl py-3 px-4 outline-none focus:bg-white focus:border-blue-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Số điện thoại *</label>
                  <input name="phone" type="tel" required value={formData.phone} onChange={handleChange}
                    className="w-full bg-gray-100 border border-gray-300 rounded-xl py-3 px-4 outline-none focus:bg-white focus:border-blue-500" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Ngày sinh</label>
                  <input name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange}
                    className="w-full bg-gray-100 border border-gray-300 rounded-xl py-3 px-4 outline-none focus:bg-white focus:border-blue-500" />
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-100 flex justify-end">
              <button 
                type="submit" disabled={isLoading}
                className="w-full md:w-auto bg-black text-white py-4 px-12 rounded-full font-bold text-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-2 group disabled:bg-gray-400"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : "Tạo tài khoản"}
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}