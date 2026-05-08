// src/app/api/dashboard/route.ts
import { NextResponse } from 'next/server';

// DATABASE GIẢ: Đơn hàng để tính toán thống kê (Bao gồm các trạng thái: success, pending, cancelled)
const mockOrdersForStats = [
  { id: 1, orderDate: "2026-04-06", totalAmount: 850000, status: "pending" },
  { id: 2, orderDate: "2026-04-05", totalAmount: 350000, status: "success" },
  { id: 3, orderDate: "2026-04-05", totalAmount: 1250000, status: "success" },
  { id: 4, orderDate: "2026-04-04", totalAmount: 420000, status: "cancelled" },
  { id: 5, orderDate: "2026-04-03", totalAmount: 960000, status: "success" },
  { id: 6, orderDate: "2026-04-02", totalAmount: 250000, status: "success" },
  { id: 7, orderDate: "2026-04-01", totalAmount: 2100000, status: "pending" },
  { id: 8, orderDate: "2026-03-28", totalAmount: 550000, status: "success" },
  { id: 9, orderDate: "2026-03-25", totalAmount: 1150000, status: "cancelled" },
  { id: 10, orderDate: "2026-03-20", totalAmount: 680000, status: "success" },
  { id: 11, orderDate: "2026-03-15", totalAmount: 1850000, status: "success" },
  { id: 12, orderDate: "2026-03-10", totalAmount: 320000, status: "pending" },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function GET(request: Request) {
  await delay(600); // Giả lập mạng
  
  const { searchParams } = new URL(request.url);
  const fromDate = searchParams.get('fromDate');
  const toDate = searchParams.get('toDate');

  // Lọc theo ngày A đến ngày B
  const filteredOrders = mockOrdersForStats.filter(order => {
    let matchFrom = true;
    let matchTo = true;
    if (fromDate) matchFrom = new Date(order.orderDate) >= new Date(fromDate);
    if (toDate) matchTo = new Date(order.orderDate) <= new Date(toDate);
    return matchFrom && matchTo;
  });

  // TÍNH TOÁN THỐNG KÊ (Đúng yêu cầu barem điểm)
  const stats = {
    orders: {
      total: filteredOrders.length,
      success: filteredOrders.filter(o => o.status === 'success').length,
      pending: filteredOrders.filter(o => o.status === 'pending').length,
      cancelled: filteredOrders.filter(o => o.status === 'cancelled').length,
    },
    revenue: {
      total: filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0),
      success: filteredOrders.filter(o => o.status === 'success').reduce((sum, o) => sum + o.totalAmount, 0),
      pending: filteredOrders.filter(o => o.status === 'pending').reduce((sum, o) => sum + o.totalAmount, 0),
      cancelled: filteredOrders.filter(o => o.status === 'cancelled').reduce((sum, o) => sum + o.totalAmount, 0),
    }
  };

  return NextResponse.json({ success: true, data: stats });
}