// src/app/api/customer/login/route.ts
import { NextResponse } from 'next/server';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(request: Request) {
  await delay(800); // Giả lập mạng chậm 0.8s
  
  try {
    const body = await request.json();
    const { email, password } = body;

    // KIỂM TRA TÀI KHOẢN KHÁCH HÀNG (Mock Data)
    if (email === 'nguyenvana@gmail.com' && password === '123456') {
      return NextResponse.json({ 
        success: true, 
        message: "Đăng nhập thành công! Chào mừng trở lại." 
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