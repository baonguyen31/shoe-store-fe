"use client";

import React from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { ChevronRight, History, Users, MapPin } from "lucide-react";
import Link from "next/link";

interface AboutItem {
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

const ABOUT_CONTENT: Record<string, AboutItem> = {
  "brand-story": {
    title: "Câu chuyện thương hiệu",
    icon: <History className="w-12 h-12 text-blue-600" />,
    content: (
      <>
        <p className="mb-4 text-gray-700 leading-relaxed text-lg">
          Chào mừng bạn đến với <strong>SHOESTORE</strong> – nơi niềm đam mê với những đôi giày và phong cách sống hiện đại giao thoa.
        </p>
        <p className="mb-4 text-gray-700 leading-relaxed">
          Được thành lập từ năm 2016, hành trình của chúng tôi bắt đầu từ một cửa hàng nhỏ với khát khao mang đến cho người tiêu dùng Việt Nam những đôi giày không chỉ đẹp về mẫu mã mà còn vượt trội về chất lượng và sự thoải mái.
        </p>
        <p className="mb-4 text-gray-700 leading-relaxed">
          Chúng tôi tin rằng, mỗi đôi giày không chỉ đơn thuần là một món phụ kiện, mà là người bạn đồng hành trên từng nẻo đường, giúp bạn tự tin thể hiện cá tính và chinh phục những đỉnh cao mới. Với triết lý &quot;Chất lượng - Uy tín - Tận tâm&quot;, SHOESTORE đã và đang khẳng định vị thế là một trong những thương hiệu bán lẻ giày thể thao hàng đầu.
        </p>
      </>
    )
  },
  "careers": {
    title: "Tuyển dụng",
    icon: <Users className="w-12 h-12 text-blue-600" />,
    content: (
      <>
        <p className="mb-6 text-gray-700 leading-relaxed text-lg">
          Gia nhập đại gia đình SHOESTORE để cùng nhau lan tỏa niềm đam mê thời trang và sự sáng tạo.
        </p>
        <div className="space-y-6">
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
            <h3 className="text-xl font-bold text-blue-900 mb-2">Nhân viên bán hàng (Full-time/Part-time)</h3>
            <p className="text-gray-600 mb-2">Số lượng: 05 | Địa điểm: Toàn quốc</p>
            <p className="text-gray-700 italic">&quot;Chúng tôi tìm kiếm những bạn trẻ năng động, yêu thích giao tiếp và có kiến thức về giày thể thao.&quot;</p>
          </div>
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
            <h3 className="text-xl font-bold text-blue-900 mb-2">Chuyên viên Marketing & Social Media</h3>
            <p className="text-gray-600 mb-2">Số lượng: 02 | Địa điểm: Trụ sở chính TP.HCM</p>
            <p className="text-gray-700">Yêu cầu khả năng sáng tạo nội dung, nắm bắt xu hướng thị trường và sử dụng thành thạo các nền tảng mạng xã hội.</p>
          </div>
        </div>
        <p className="mt-8 text-gray-600">
          Mọi CV xin vui lòng gửi về hòm thư: <strong>hr@shoestore.com</strong> với tiêu đề [Họ tên - Vị trí ứng tuyển].
        </p>
      </>
    )
  },
  "stores": {
    title: "Hệ thống cửa hàng",
    icon: <MapPin className="w-12 h-12 text-blue-600" />,
    content: (
      <>
        <p className="mb-6 text-gray-700 leading-relaxed text-lg">
          Trải nghiệm trực tiếp và thử giày tại hệ thống 15 cửa hàng SHOESTORE trên toàn quốc.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 p-6 rounded-2xl hover:shadow-lg transition-shadow">
            <h3 className="font-bold text-gray-900 text-lg mb-2 underline decoration-blue-500">Khu vực TP. Hồ Chí Minh</h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>📍 789 Nguyễn Huệ, Phường Bến Nghé, Quận 1 (Flagship Store)</li>
              <li>📍 123 Lê Lợi, Quận 1</li>
              <li>📍 456 CMT8, Quận 10</li>
            </ul>
          </div>
          <div className="border border-gray-200 p-6 rounded-2xl hover:shadow-lg transition-shadow">
            <h3 className="font-bold text-gray-900 text-lg mb-2 underline decoration-blue-500">Khu vực Hà Nội</h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>📍 456 Tây Sơn, Phường Quang Trung, Quận Đống Đa</li>
              <li>📍 101 Tràng Tiền, Quận Hoàn Kiếm</li>
            </ul>
          </div>
        </div>
      </>
    )
  }
};

export default function AboutPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const data = ABOUT_CONTENT[slug];

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
          <span className="text-gray-500">Về chúng tôi</span>
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

          <div className="prose prose-blue max-w-none">
            {data.content}
          </div>
        </div>
      </div>
    </main>
  );
}
