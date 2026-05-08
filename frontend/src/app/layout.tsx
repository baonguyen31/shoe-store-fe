import type { Metadata } from "next";
// 1. Import font Open Sans từ Google
import { Open_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

// 2. Cấu hình font
const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  // Đặt tên biến để dùng bên Tailwind
  variable: "--font-open-sans",
  // Tùy chọn độ đậm (nếu cần cụ thể, hoặc để trống nó sẽ lấy auto)
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Shoe Store - Giày chính hãng",
  description: "Cửa hàng bán giày uy tín nhất",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      {/* 3. Thêm biến font vào body và class font-sans */}
      <body className={`${openSans.variable} font-sans antialiased`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: "10px",
              fontFamily: "var(--font-open-sans)",
              fontSize: "14px",
            },
            success: {
              iconTheme: { primary: "#22c55e", secondary: "#fff" },
            },
            error: {
              iconTheme: { primary: "#ef4444", secondary: "#fff" },
            },
          }}
        />
      </body>
    </html>
  );
}
