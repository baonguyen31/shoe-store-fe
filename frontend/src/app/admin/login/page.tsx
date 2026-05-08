"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  Loader2,
  ArrowRight,
  XCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldAlert,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (msg: string, type: "success" | "error") => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }),
      });

      const data = await response.json();
      const token = data.token;

      if (response.ok && token && token !== "fail") {
        // --- ĐOẠN KIỂM TRA ROLE BỔ SUNG ---
        // Thử gọi 1 API chỉ dành cho Admin để kiểm tra xem Token này có quyền STAFF/ADMIN không
        const checkRole = await fetch(
          "http://localhost:8080/api/employers?page_no=0&page_size=1",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (checkRole.status === 403) {
          showToast("Bạn không có quyền truy cập hệ thống nội bộ!", "error");
          setIsLoading(false);
          return; // Dừng lại, không lưu token
        }
        // ----------------------------------

        sessionStorage.setItem("token", token);

        // Lấy thêm thông tin nhân viên
        try {
          const meRes = await fetch("http://localhost:8080/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (meRes.ok) {
            const meData = await meRes.json();
            if (meData.code === 200) {
              sessionStorage.setItem("employerId", meData.result.id.toString());
              sessionStorage.setItem("customerName", meData.result.fullName);
              sessionStorage.setItem("customerEmail", meData.result.email);
              // Phát sự kiện cập nhật UI
              window.dispatchEvent(new Event("authUpdated"));
            }
          }
        } catch (err) {
          console.error("Lỗi lấy thông tin admin", err);
        }

        showToast("Xác thực thành công! Đang vào hệ thống...", "success");

        setTimeout(() => {
          router.push("/admin/dashboard");
        }, 1000);
      } else {
        showToast("Email hoặc mật khẩu không chính xác!", "error");
        setIsLoading(false);
      }
    } catch {
      showToast("Lỗi kết nối Server!", "error");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      {/* TOAST NOTIFICATION */}
      {toastMsg && (
        <div
          className={`fixed top-6 right-6 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-[60] animate-in slide-in-from-right-8 ${toastType === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}
        >
          {toastType === "success" ? (
            <CheckCircle2 size={24} />
          ) : (
            <XCircle size={24} />
          )}
          <span className="font-bold tracking-wide uppercase text-sm">
            {toastMsg}
          </span>
        </div>
      )}

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-4">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-200">
            <ShieldAlert className="text-white" size={32} />
          </div>
        </div>
        <h2 className="text-center text-3xl font-black text-slate-900 uppercase tracking-tighter">
          Hệ thống <span className="text-blue-600">Nội bộ</span>
        </h2>
        <p className="mt-2 text-center text-sm font-black text-slate-500 uppercase tracking-widest">
          Chỉ dành cho Nhân viên & Quản trị
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-8 shadow-2xl shadow-slate-200 rounded-[2.5rem] border border-slate-100 relative overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center backdrop-blur-sm">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
                Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none font-bold transition-all text-slate-900"
                  placeholder="admin@shoestore.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
                Mật khẩu
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-12  py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none font-bold transition-all text-slate-900"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-3 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-black hover:shadow-xl transition-all active:scale-95 disabled:opacity-50"
            >
              Đăng nhập
              <ArrowRight size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
