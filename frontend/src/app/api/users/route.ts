// src/app/api/users/route.ts
import { NextResponse } from 'next/server';

// 1. CHUYỂN MẢNG DỮ LIỆU VÀO ĐÂY (Làm "Database giả")
let mockUsersDatabase = [
  { id: 1, fullName: "Nguyễn Văn An", account: "an.nguyen@gmail.com", phone: "0901234567", street: "123 Lê Lợi", ward: "Phường Bến Nghé", city: "TP.HCM", role: "admin", status: "active" },
  { id: 2, fullName: "Trần Thị Bích", account: "bich.tran@yahoo.com", phone: "0912345678", street: "45 Tây Sơn", ward: "Phường Quang Trung", city: "Hà Nội", role: "staff", status: "active" },
  { id: 3, fullName: "Lê Hoàng Cường", account: "cuong.le@outlook.com", phone: "0923456789", street: "78 Nguyễn Văn Linh", ward: "Phường Nam Dương", city: "Đà Nẵng", role: "customer", status: "active" },
  { id: 4, fullName: "Phạm Duyên", account: "duyen.pham@gmail.com", phone: "0934567890", street: "12 30 Tháng 4", ward: "Phường Hưng Lợi", city: "Cần Thơ", role: "customer", status: "locked" },
  { id: 5, fullName: "Hoàng Tuấn Anh", account: "anh.hoang@gmail.com", phone: "0945678901", street: "89 Lê Văn Sỹ", ward: "Phường 14", city: "TP.HCM", role: "staff", status: "active" },
  { id: 6, fullName: "Vũ Thị Hoa", account: "hoa.vu@gmail.com", phone: "0956789012", street: "12 Cầu Giấy", ward: "Phường Quan Hoa", city: "Hà Nội", role: "customer", status: "active" },
  { id: 7, fullName: "Đặng Quang Huy", account: "huy.dang@gmail.com", phone: "0967890123", street: "45 Quang Trung", ward: "Phường 10", city: "TP.HCM", role: "customer", status: "locked" },
  { id: 8, fullName: "Bùi Thị Lan", account: "lan.bui@gmail.com", phone: "0978901234", street: "88 Trần Phú", ward: "Phường Hải Châu 1", city: "Đà Nẵng", role: "staff", status: "active" },
  { id: 9, fullName: "Đỗ Minh Đức", account: "duc.do@gmail.com", phone: "0989012345", street: "22 Bình Thạnh", ward: "Phường 22", city: "TP.HCM", role: "customer", status: "active" },
  { id: 10, fullName: "Ngô Thanh Vân", account: "van.ngo@gmail.com", phone: "0990123456", street: "55 Nguyễn Trãi", ward: "Phường Thanh Xuân Bắc", city: "Hà Nội", role: "customer", status: "active" },
  { id: 11, fullName: "Lý Hải", account: "hai.ly@gmail.com", phone: "0881234567", street: "99 Nguyễn Văn Linh", ward: "Phường Tân Phong", city: "TP.HCM", role: "customer", status: "active" },
  { id: 12, fullName: "Tạ Thị Mai", account: "mai.ta@gmail.com", phone: "0872345678", street: "102 Trần Phú", ward: "Phường Mộ Lao", city: "Hà Nội", role: "customer", status: "locked" },
];

// Hàm giả lập độ trễ mạng (Network Latency)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 2. API GET: LẤY DANH SÁCH (Có xử lý logic lọc dữ liệu)
export async function GET(request: Request) {
  // Giả lập mạng chậm mất 800ms
  await delay(800);

  // Lấy các tham số lọc từ URL (ví dụ: /api/users?name=An&role=admin)
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name') || "";
  const account = searchParams.get('account') || "";
  const role = searchParams.get('role') || "all";
  const status = searchParams.get('status') || "all";

  // Lọc dữ liệu tại "Server"
  const filteredData = mockUsersDatabase.filter(user => {
    const matchName = user.fullName.toLowerCase().includes(name.toLowerCase());
    const matchAccount = user.account.toLowerCase().includes(account.toLowerCase());
    const matchRole = role === "all" ? true : user.role === role;
    const matchStatus = status === "all" ? true : user.status === status;
    return matchName && matchAccount && matchRole && matchStatus;
  });

  return NextResponse.json({ 
    success: true, 
    total: filteredData.length,
    data: filteredData 
  });
}

// 3. API POST: THÊM NGƯỜI MỚI
export async function POST(request: Request) {
  await delay(500); // Giả lập mạng
  try {
    const body = await request.json();
    
    // Tạo ID mới
    const newId = mockUsersDatabase.length > 0 ? Math.max(...mockUsersDatabase.map(u => u.id)) + 1 : 1;
    const newUser = { id: newId, ...body };
    
    // Thêm vào "Database giả"
    mockUsersDatabase = [newUser, ...mockUsersDatabase];

    return NextResponse.json({ success: true, message: "Thêm thành công!", data: newUser });
  } catch {
    return NextResponse.json({ success: false, message: "Lỗi dữ liệu" }, { status: 400 });
  }
}