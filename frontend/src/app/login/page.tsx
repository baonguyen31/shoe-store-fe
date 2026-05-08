"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Lock,
  ArrowRight,
  ChevronLeft,
  Loader2,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
} from "lucide-react";

const LoginPage = () => {
  const router = useRouter();

  // 1. CÁC STATES QUẢN LÝ DỮ LIỆU
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // State điều khiển chế độ Quên mật khẩu
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  // TOAST THÔNG BÁO
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (msg: string, type: "success" | "error") => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(""), 3000);
  };

  // 2. HÀM XỬ LÝ ĐĂNG NHẬP (GIỮ NGUYÊN CODE CŨ)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }),
      });

      const data = await res.json();
      const token = data.token;

      if (res.ok && token && token !== "fail") {
        sessionStorage.setItem("token", token);

        // Lấy thông tin người dùng
        try {
          const meRes = await fetch("http://localhost:8080/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (meRes.ok) {
            const meData = await meRes.json();
            if (meData.code === 200) {
              sessionStorage.setItem("customerName", meData.result.fullName);
              sessionStorage.setItem("customerEmail", meData.result.email);
              sessionStorage.setItem("customerId", meData.result.id.toString());
              window.dispatchEvent(new Event("authUpdated"));
            }
          }
        } catch (e) {
          console.error("Lỗi lấy thông tin user", e);
        }

        showToast("Đăng nhập thành công!", "success");
        setTimeout(() => router.push("/"), 1000);
      } else {
        showToast("Email hoặc mật khẩu không chính xác!", "error");
        setIsLoading(false);
      }
    } catch (error) {
      showToast("Lỗi kết nối máy chủ 8080!", "error");
      setIsLoading(false);
    }
  };

  // 3. HÀM XỬ LÝ QUÊN MẬT KHẨU (MỚI THÊM)
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast("Vui lòng nhập email để nhận lại mật khẩu!", "error");
      return;
    }

    setIsLoading(true);

    try {
      // Gọi API reset password bên Backend (đã hướng dẫn ở bước trước)
      const res = await fetch("http://localhost:8080/forgot-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        showToast(
          "Yêu cầu khôi phục đã được gửi tới Quản trị viên!", 
          "success"
        );
        // Đợi 2 giây rồi quay lại màn hình đăng nhập
        setTimeout(() => {
          setIsForgotPassword(false);
          setIsLoading(false);
        }, 2000);
      } else {
        showToast("Email không tồn tại trong hệ thống!", "error");
        setIsLoading(false);
      }
    } catch (error) {
      showToast("Lỗi kết nối server!", "error");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col font-sans relative">
      {/* TOAST THÔNG BÁO */}
      {toastMsg && (
        <div
          className={`fixed top-20 right-6 bg-white border-l-4 shadow-xl px-6 py-4 rounded-lg flex items-center gap-3 z-[60] animate-in slide-in-from-right-8 ${toastType === "success" ? "border-green-500" : "border-red-500"}`}
        >
          {toastType === "success" ? (
            <CheckCircle2 className="text-green-500" size={24} />
          ) : (
            <XCircle className="text-red-500" size={24} />
          )}
          <span className="font-medium text-gray-800">{toastMsg}</span>
        </div>
      )}

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-black text-blue-600 tracking-tighter italic"
          >
            SHOE<span className="text-black">STORE</span>
          </Link>
          <button
            onClick={() =>
              isForgotPassword ? setIsForgotPassword(false) : router.push("/")
            }
            className="text-sm font-bold text-gray-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
          >
            <ChevronLeft size={16} />{" "}
            {isForgotPassword ? "Quay lại đăng nhập" : "Quay lại trang chủ"}
          </button>
        </div>
      </nav>

      <div className="flex-grow flex items-center justify-center px-4 pt-24 pb-12">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-blue-100/30 p-8 md:p-12 border border-gray-100 relative overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 bg-white/60 z-20 flex items-center justify-center backdrop-blur-[2px]">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
          )}

          {/* TIÊU ĐỀ THAY ĐỔI THEO CHẾ ĐỘ */}
          <div className="text-center mb-10 relative">
            <h1 className="text-3xl font-bold text-gray-900 tracking-wide uppercase mb-2">
              {isForgotPassword ? (
                <>
                  Khôi phục <span className="text-blue-600">mật khẩu</span>
                </>
              ) : (
                <>
                  Chào mừng <span className="text-blue-600">trở lại!</span>
                </>
              )}
            </h1>
            <p className="text-gray-500 font-medium">
              {isForgotPassword
                ? "Chúng tôi sẽ gửi mật khẩu mới vào email của bạn."
                : "Đăng nhập để sở hữu đôi giày mơ ước của bạn."}
            </p>
          </div>

          {isForgotPassword ? (
            // ================= FORM QUÊN MẬT KHẨU =================
            <form
              className="space-y-6 relative animate-in fade-in slide-in-from-bottom-4"
              onSubmit={handleForgotPassword}
            >
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-700 ml-1">
                  Địa chỉ Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-100 border border-gray-300 focus:border-blue-500 focus:bg-white rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-medium text-gray-900 shadow-sm"
                    placeholder="ví dụ: abc@gmail.com"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-200 flex items-center justify-center gap-3 uppercase tracking-wide disabled:opacity-70"
                >
                  Gửi yêu cầu khôi phục
                </button>
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(false)}
                  className="w-full text-gray-500 py-2 font-bold hover:text-blue-600 transition-all text-sm uppercase tracking-widest"
                >
                  Quay lại đăng nhập
                </button>
              </div>
            </form>
          ) : (
            // ================= FORM ĐĂNG NHẬP (GIỮ NGUYÊN) =================
            <form
              className="space-y-6 relative animate-in fade-in slide-in-from-bottom-4"
              onSubmit={handleSubmit}
            >
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-700 ml-1">
                  Địa chỉ Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-100 border border-gray-300 focus:border-blue-500 focus:bg-white rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-medium text-gray-900 shadow-sm"
                    placeholder="nguyenvana@gmail.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1 mb-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-700">
                    Mật khẩu
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-widest transition-colors outline-none"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-100 border border-gray-300 focus:border-blue-500 focus:bg-white rounded-2xl py-4 pl-12 pr-12 outline-none transition-all font-medium text-gray-900 shadow-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-600 transition-colors outline-none"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gray-900 text-white py-5 rounded-2xl font-bold text-lg hover:bg-black transition-all active:scale-95 shadow-xl shadow-gray-200 flex items-center justify-center gap-3 group uppercase tracking-wide disabled:opacity-70"
              >
                Đăng nhập ngay
                {!isLoading && (
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                )}
              </button>
            </form>
          )}

          <div className="mt-8 flex items-center justify-between gap-4">
            <div className="h-[1px] bg-gray-200 flex-grow"></div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Hoặc
            </span>
            <div className="h-[1px] bg-gray-200 flex-grow"></div>
          </div>

          <p className="mt-10 text-center text-sm font-medium text-gray-500">
            Chưa có tài khoản?{" "}
            <Link
              href="/register"
              className="text-blue-600 font-bold hover:underline ml-1"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
