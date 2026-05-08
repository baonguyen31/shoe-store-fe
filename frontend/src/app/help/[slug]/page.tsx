"use client";

import React from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { ChevronRight, HelpCircle, RefreshCcw, ShieldCheck } from "lucide-react";
import Link from "next/link";

const HELP_CONTENT: Record<string, { title: string; icon: React.ReactNode; content: React.ReactNode }> = {
  "buying-guide": {
    title: "Hướng dẫn mua hàng",
    icon: <HelpCircle className="w-12 h-12 text-blue-600" />,
    content: (
      <div className="space-y-6">
        <div className="flex gap-4">
          <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Tìm kiếm sản phẩm</h3>
            <p className="text-gray-600">Sử dụng thanh tìm kiếm hoặc duyệt qua các danh mục (Nam, Nữ, Cặp đôi) để tìm đôi giày bạn yêu thích.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Chọn Size và Màu sắc</h3>
            <p className="text-gray-600">Tại trang chi tiết, chọn đúng kích cỡ và màu sắc sau đó bấm &quot;Thêm vào giỏ hàng&quot;.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Thanh toán</h3>
            <p className="text-gray-600">Vào giỏ hàng, điền thông tin người nhận và chọn phương thức thanh toán (COD hoặc MOMO) để hoàn tất đơn hàng.</p>
          </div>
        </div>
      </div>
    )
  },
  "returns": {
    title: "Chính sách đổi trả",
    icon: <RefreshCcw className="w-12 h-12 text-blue-600" />,
    content: (
      <div className="space-y-4 text-gray-700">
        <p>Chúng tôi cam kết mang lại sự hài lòng tuyệt đối. Nếu sản phẩm không vừa hoặc có lỗi từ nhà sản xuất, bạn có thể đổi trả theo chính sách sau:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Thời gian:</strong> Trong vòng 30 ngày kể từ ngày nhận hàng.</li>
          <li><strong>Điều kiện:</strong> Sản phẩm còn nguyên tem mác, chưa qua sử dụng và còn hóa đơn mua hàng.</li>
          <li><strong>Chi phí:</strong> Miễn phí đổi trả nếu sản phẩm có lỗi kỹ thuật. Đối với nhu cầu đổi size/mẫu, quý khách vui lòng thanh toán phí vận chuyển.</li>
        </ul>
        <p className="mt-4 p-4 bg-orange-50 border-l-4 border-orange-400 text-orange-800 text-sm">
          Lưu ý: Các sản phẩm nằm trong chương trình khuyến mãi trên 50% sẽ không được hỗ trợ đổi trả trừ trường hợp lỗi từ nhà sản xuất.
        </p>
      </div>
    )
  },
  "privacy": {
    title: "Bảo mật thông tin",
    icon: <ShieldCheck className="w-12 h-12 text-blue-600" />,
    content: (
      <div className="space-y-4 text-gray-700 leading-relaxed">
        <p>Bảo mật thông tin khách hàng là ưu tiên hàng đầu của SHOESTORE. Chúng tôi cam kết:</p>
        <ol className="list-decimal pl-6 space-y-4">
          <li>
            <strong>Thu thập thông tin:</strong> Chúng tôi chỉ thu thập các thông tin cần thiết như Họ tên, Số điện thoại, Email và Địa chỉ để phục vụ mục đích giao hàng và chăm sóc khách hàng.
          </li>
          <li>
            <strong>Sử dụng thông tin:</strong> Thông tin của bạn sẽ được bảo mật tuyệt đối và chỉ sử dụng nội bộ để nâng cao chất lượng dịch vụ.
          </li>
          <li>
            <strong>Cam kết không chia sẻ:</strong> Chúng tôi cam kết không bán, chia sẻ hay trao đổi thông tin cá nhân của khách hàng cho bất kỳ bên thứ ba nào.
          </li>
          <li>
            <strong>Bảo mật thanh toán:</strong> Mọi giao dịch trực tuyến đều được mã hóa theo tiêu chuẩn quốc tế để đảm bảo an toàn tài chính cho bạn.
          </li>
        </ol>
      </div>
    )
  }
};

export default function HelpPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const data = HELP_CONTENT[slug];

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Nội dung không tồn tại.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      
      <div className="pt-24 pb-20 container mx-auto px-4 max-w-4xl">
        {/* Breadcrumb */}
        <div className="text-sm font-medium mb-8 flex items-center gap-2">
          <Link href="/" className="text-gray-500 hover:text-black transition">Trang chủ</Link>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-gray-500">Hỗ trợ</span>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-black">{data.title}</span>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-100/20 p-8 md:p-16 border border-gray-100">
          <div className="flex flex-col items-center text-center mb-12">
            <div className="mb-6 p-4 bg-blue-50 rounded-3xl">
              {data.icon}
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 uppercase tracking-tight">
              {data.title}
            </h1>
            <div className="w-20 h-1 bg-blue-600 mt-4 rounded-full"></div>
          </div>

          <div className="max-w-none">
            {data.content}
          </div>
        </div>
      </div>
    </main>
  );
}
