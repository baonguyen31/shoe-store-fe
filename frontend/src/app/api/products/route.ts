// src/app/api/products/route.ts
import { NextResponse } from 'next/server';

// 1. DATABASE GIẢ: 12 Đôi giày thực tế
let mockProductsDatabase = [
  { id: 1, name: "Giày Thể Thao Nam N801", brand: "Nike", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=300", importPrice: 850000, sellPrice: 1250000, category: "Giày Thể Thao Nam", status: "visible", description: "Giày chạy bộ siêu nhẹ, êm ái." },
  { id: 2, name: "Giày Chạy Bộ Nữ A-Boost", brand: "Adidas", image: "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?q=80&w=300", importPrice: 900000, sellPrice: 1400000, category: "Giày Chạy Bộ", status: "visible", description: "Công nghệ đế boost trợ lực tốt." },
  { id: 3, name: "Sneaker Cổ Thấp Trắng", brand: "Puma", image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=300", importPrice: 600000, sellPrice: 850000, category: "Giày Sneaker", status: "visible", description: "Mẫu giày casual dễ phối đồ." },
  { id: 4, name: "Giày Bóng Rổ Jordan 1", brand: "Nike", image: "https://images.unsplash.com/photo-1574561569420-10ef4f21bbdd?q=80&w=300", importPrice: 1500000, sellPrice: 2800000, category: "Giày Thể Thao Nam", status: "hidden", description: "Phiên bản giới hạn." },
  { id: 5, name: "Giày Vải Canvas Classic", brand: "Converse", image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=300", importPrice: 400000, sellPrice: 650000, category: "Giày Sneaker", status: "visible", description: "Huyền thoại giày vải không bao giờ lỗi mốt." },
  { id: 6, name: "Giày Thể Thao Nữ P-01", brand: "Puma", image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=300", importPrice: 550000, sellPrice: 890000, category: "Giày Thể Thao Nữ", status: "visible", description: "Đệm êm, hợp tập gym." },
  { id: 7, name: "Giày Lười Nam Da Thật", brand: "Local Brand", image: "https://images.unsplash.com/photo-1614252339460-e171b3e9a7e0?q=80&w=300", importPrice: 350000, sellPrice: 590000, category: "Giày Lười", status: "visible", description: "Chất liệu da thật 100%." },
  { id: 8, name: "Giày Chạy Trail V2", brand: "Salomon", image: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?q=80&w=300", importPrice: 1200000, sellPrice: 1850000, category: "Giày Chạy Bộ", status: "hidden", description: "Giày chạy địa hình chuyên dụng." },
  { id: 9, name: "Sneaker Đế Chunky", brand: "Fila", image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=300", importPrice: 750000, sellPrice: 1150000, category: "Giày Sneaker", status: "visible", description: "Trend đế thô hack chiều cao." },
  { id: 10, name: "Giày Slip-on Caro", brand: "Vans", image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=300", importPrice: 450000, sellPrice: 720000, category: "Giày Lười", status: "visible", description: "Mẫu slip-on huyền thoại." },
  { id: 11, name: "Giày Thể Thao Nữ N802", brand: "Nike", image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=300", importPrice: 800000, sellPrice: 1350000, category: "Giày Thể Thao Nữ", status: "visible", description: "Bản phối màu pastel ngọt ngào." },
  { id: 12, name: "Giày Tập Gym Nam", brand: "Reebok", image: "https://images.unsplash.com/photo-1584735174965-48c48d7028a9?q=80&w=300", importPrice: 650000, sellPrice: 990000, category: "Giày Thể Thao Nam", status: "visible", description: "Đế bằng bám sàn tốt." },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function GET(request: Request) {
  await delay(600); 
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name') || "";
  const category = searchParams.get('category') || "all";

  const filteredData = mockProductsDatabase.filter(prod => {
    const matchName = prod.name.toLowerCase().includes(name.toLowerCase()) || prod.brand.toLowerCase().includes(name.toLowerCase());
    const matchCat = category === "all" ? true : prod.category === category;
    return matchName && matchCat;
  });

  return NextResponse.json({ success: true, data: filteredData });
}

export async function POST(request: Request) {
  await delay(500); 
  try {
    const body = await request.json();
    const newId = mockProductsDatabase.length > 0 ? Math.max(...mockProductsDatabase.map(p => p.id)) + 1 : 1;
    const newProduct = { id: newId, ...body };
    mockProductsDatabase = [newProduct, ...mockProductsDatabase];
    return NextResponse.json({ success: true, message: "Thêm sản phẩm thành công!" });
  } catch {
    return NextResponse.json({ success: false, message: "Lỗi dữ liệu" }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  await delay(500);
  try {
    const body = await request.json();
    mockProductsDatabase = mockProductsDatabase.map(p => p.id === body.id ? body : p);
    return NextResponse.json({ success: true, message: "Cập nhật sản phẩm thành công!" });
  } catch {
    return NextResponse.json({ success: false, message: "Lỗi dữ liệu" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  await delay(500);
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get('id'));
    mockProductsDatabase = mockProductsDatabase.filter(p => p.id !== id);
    return NextResponse.json({ success: true, message: "Đã xóa sản phẩm!" });
  } catch {
    return NextResponse.json({ success: false, message: "Lỗi khi xóa" }, { status: 400 });
  }
}