// src/app/api/login/route.ts
import { NextResponse } from 'next/server';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(request: Request) {
  await delay(800); // Giả lập độ trễ mạng
  
  try {
    const body = await request.json();
    const { email, password } = body;

    // KIỂM TRA TÀI KHOẢN (Mock Data)
    if (email === 'admin@gmail.com' && password === '123456') {
      // Trong thực tế, lúc này Backend sẽ tạo Token (JWT) hoặc Session và trả về
      return NextResponse.json({ 
        success: true, 
        message: "Đăng nhập thành công! Đang chuyển hướng..." 
      });
    }

    // Nếu sai thông tin
    return NextResponse.json({ 
      success: false, 
      message: "Email hoặc mật khẩu không chính xác!" 
    }, { status: 401 });

  } catch {
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 400 });
  }
}