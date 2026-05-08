"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Smartphone, ShieldCheck, ArrowLeft, Copy, Check } from "lucide-react";

interface PaymentData {
  qrUrl: string;
  phone: string;
  accountName: string;
  amount: number;
  orderId: string;
}

function MomoPaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetch(`http://localhost:8080/api/payment/momo/create_payment?orderId=${orderId}`, {
        headers: { "Authorization": `Bearer ${sessionStorage.getItem("token")}` }
      })
      .then(res => res.json())
      .then(result => {
        if (result.code === 200 && result.result) {
          setPaymentData(result.result);
        }
        setIsLoading(false);
      });
    }
  }, [orderId]);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      const res = await fetch(`http://localhost:8080/api/payment/momo/sync?orderId=${orderId}&resultCode=0`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${sessionStorage.getItem("token")}` }
      });
      const result = await res.json();
      if (result.code === 200) {
        alert("Xác nhận thanh toán thành công!");
        router.push("/profile");
      } else {
        alert("Lỗi: " + (result.message || "Không thể xác nhận"));
      }
    } catch {
      alert("Lỗi khi xác nhận!");
    } finally {
      setIsConfirming(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 font-sans">
      <Loader2 className="w-12 h-12 text-pink-600 animate-spin mb-4" />
      <p className="font-bold text-gray-600">Đang khởi tạo mã thanh toán...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans flex items-center justify-center">
      <div className="max-w-4xl w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 flex flex-col md:flex-row">
        
        {/* CỘT TRÁI: QR CODE */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 bg-pink-50/30 flex flex-col items-center justify-center border-r border-gray-100">
          <div className="bg-white p-6 rounded-[2rem] shadow-xl border-4 border-pink-500 relative">
            <Image 
              src={paymentData?.qrUrl || ""} 
              alt="MoMo QR" 
              width={256} 
              height={256} 
              className="object-contain" 
            />
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-pink-500 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
              Quét mã để thanh toán
            </div>
          </div>
          
          <div className="mt-10 text-center">
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Hướng dẫn</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-left">
                <div className="w-6 h-6 rounded-full bg-pink-600 text-white text-xs font-bold flex items-center justify-center">1</div>
                <p className="text-sm font-medium text-gray-600">Mở ứng dụng <span className="text-pink-600 font-bold">MoMo</span></p>
              </div>
              <div className="flex items-center gap-3 text-left">
                <div className="w-6 h-6 rounded-full bg-pink-600 text-white text-xs font-bold flex items-center justify-center">2</div>
                <p className="text-sm font-medium text-gray-600">Chọn <span className="font-bold">Quét mã</span> và quét ảnh QR</p>
              </div>
              <div className="flex items-center gap-3 text-left">
                <div className="w-6 h-6 rounded-full bg-pink-600 text-white text-xs font-bold flex items-center justify-center">3</div>
                <p className="text-sm font-medium text-gray-600">Kiểm tra thông tin và <span className="font-bold">Xác nhận</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: THÔNG TIN TÀI KHOẢN */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-between relative">
          <div>
            <div className="flex items-center justify-between mb-8">
              <div className="relative h-10 w-24">
                <Image 
                  src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" 
                  alt="MoMo" 
                  fill 
                  className="object-contain object-left" 
                />
              </div>
              <div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full">
                <ShieldCheck size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Bảo mật</span>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-tight mb-8">
              Thông tin <span className="text-pink-600">chuyển khoản</span>
            </h1>

            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 group relative">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Số điện thoại MoMo</p>
                <div className="flex justify-between items-center">
                  <p className="text-lg font-black text-gray-900">{paymentData?.phone}</p>
                  <button onClick={() => copyToClipboard(paymentData?.phone || "")} className="text-pink-600 hover:scale-110 transition">
                    {isCopied ? <Check size={20} /> : <Copy size={20} />}
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tên tài khoản</p>
                <p className="text-lg font-black text-gray-900 uppercase">{paymentData?.accountName}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Số tiền cần thanh toán</p>
                <p className="text-2xl font-black text-pink-600">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(paymentData?.amount || 0)}
                </p>
              </div>

              <div className="bg-pink-600/5 p-4 rounded-2xl border border-pink-200 border-dashed">
                <p className="text-[10px] font-bold text-pink-600 uppercase tracking-widest mb-1">Nội dung chuyển khoản</p>
                <p className="text-md font-bold text-gray-900">THANH TOAN DON HANG {paymentData?.orderId}</p>
              </div>
            </div>
          </div>

          <div className="mt-12 space-y-4">
            <button 
              onClick={handleConfirm}
              disabled={isConfirming}
              className="w-full bg-pink-600 text-white py-5 rounded-2xl font-bold text-lg hover:bg-pink-700 transition-all active:scale-95 shadow-xl shadow-pink-200 flex items-center justify-center gap-3 uppercase tracking-wide"
            >
              {isConfirming ? <Loader2 className="animate-spin" /> : <Smartphone size={20} />}
              Xác nhận đã chuyển tiền
            </button>
            <button 
              onClick={() => router.push("/cart")}
              className="w-full py-2 text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-gray-600 transition flex items-center justify-center gap-2"
            >
              <ArrowLeft size={14} /> Quay lại giỏ hàng
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function MomoPaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 font-sans">
        <Loader2 className="w-12 h-12 text-pink-600 animate-spin mb-4" />
        <p className="font-bold text-gray-600">Đang tải...</p>
      </div>
    }>
      <MomoPaymentContent />
    </Suspense>
  );
}
