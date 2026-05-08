"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, RefreshCcw, Loader2, ShoppingBag, CheckCircle, Clock, XCircle, DollarSign, CreditCard, AlertCircle, TrendingDown } from "lucide-react";
import { apiRequest } from "@/services/app";

export default function AdminDashboardPage() {
  // 1. STATES BỘ LỌC NGÀY
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({ fromDate: "", toDate: "" });

  // 2. STATES DỮ LIỆU & LOADING
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    orders: { total: 0, success: 0, pending: 0, cancelled: 0 },
    revenue: { total: 0, success: 0, pending: 0, cancelled: 0 }
  });

  // HÀM FORMAT TIỀN
  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price) + " đ";

  // ==========================================
  // HÀM GỌI API ĐỂ LẤY THỐNG KÊ
  // ==========================================
  const fetchDashboardStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      if (appliedFilters.fromDate) query.append('fromDate', appliedFilters.fromDate);
      if (appliedFilters.toDate) query.append('toDate', appliedFilters.toDate);

      const response = await apiRequest(`/api/dashboard?${query.toString()}`);
      const result = await response.json();
      
      if (result.code === 200) {
        setStats(result.result);
      }
    } catch (error) {
      console.error("Lỗi lấy dữ liệu thống kê:", error);
    } finally {
      setIsLoading(false);
    }
  }, [appliedFilters.fromDate, appliedFilters.toDate]);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  // HÀNH ĐỘNG BẤM TÌM KIẾM
  const handleSearchClick = () => setAppliedFilters({ fromDate, toDate });

  // HÀNH ĐỘNG ĐẶT LẠI
  const handleResetFilters = () => {
    setFromDate("");
    setToDate("");
    setAppliedFilters({ fromDate: "", toDate: "" });
  };

  return (
    <div className="relative min-h-[80vh] font-sans pb-10">
      
      {/* --- TIÊU ĐỀ TRANG --- */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <h1 className="text-xl font-bold text-blue-600 uppercase">Thống kê & Báo cáo</h1>
        <p className="text-sm text-gray-500 mt-1">Tổng hợp doanh thu và tình trạng đơn hàng</p>
      </div>

      {/* --- BỘ LỌC NGÀY (Từ ngày A đến ngày B) --- */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Từ ngày</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full border-2 border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none shadow-sm transition-all" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Đến ngày</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full border-2 border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none shadow-sm transition-all" />
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={handleSearchClick} className="bg-[#22C55E] text-white px-6 py-2.5 rounded-lg shadow-sm hover:bg-[#16A34A] transition flex items-center gap-2 font-bold">
            <Search size={18} /> Thống kê
          </button>
          <button onClick={handleResetFilters} className="bg-gray-600 text-white px-6 py-2.5 rounded-lg shadow-sm hover:bg-gray-700 transition flex items-center gap-2 font-bold">
            <RefreshCcw size={18} /> Đặt lại
          </button>
        </div>
      </div>

      {/* --- HIỆU ỨNG LOADING --- */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center backdrop-blur-sm rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            <span className="font-semibold text-blue-800">Đang tính toán số liệu...</span>
          </div>
        </div>
      )}

      {/* --- KHU VỰC 1: THỐNG KÊ SỐ LƯỢNG ĐƠN HÀNG --- */}
      <h2 className="text-lg font-bold text-gray-800 mb-4 mt-8 flex items-center gap-2 border-l-4 border-blue-600 pl-3">
        <ShoppingBag size={20} className="text-blue-600"/> Thống kê số lượng đơn hàng
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Tổng số đơn */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-b-4 border-b-blue-500 hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1">TỔNG SỐ ĐƠN</p>
              <h3 className="text-3xl font-bold text-gray-900">{stats.orders.total}</h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-blue-600"><ShoppingBag size={24}/></div>
          </div>
        </div>

        {/* Đơn thành công */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-b-4 border-b-green-500 hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1">ĐÃ THANH TOÁN</p>
              <h3 className="text-3xl font-bold text-gray-900">{stats.orders.success}</h3>
            </div>
            <div className="p-3 bg-green-50 rounded-lg text-green-600"><CheckCircle size={24}/></div>
          </div>
        </div>

        {/* Đơn chờ thanh toán */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-b-4 border-b-orange-400 hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1">CHỜ THANH TOÁN</p>
              <h3 className="text-3xl font-bold text-gray-900">{stats.orders.pending}</h3>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg text-orange-500"><Clock size={24}/></div>
          </div>
        </div>

        {/* Đơn đã hủy */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-b-4 border-b-red-500 hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1">ĐƠN ĐÃ HỦY</p>
              <h3 className="text-3xl font-bold text-gray-900">{stats.orders.cancelled}</h3>
            </div>
            <div className="p-3 bg-red-50 rounded-lg text-red-600"><XCircle size={24}/></div>
          </div>
        </div>

      </div>

      {/* --- KHU VỰC 2: THỐNG KÊ DOANH THU --- */}
      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-l-4 border-green-600 pl-3">
        <DollarSign size={20} className="text-green-600"/> Thống kê doanh thu theo tình trạng
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Tổng doanh thu */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 rounded-xl shadow-md text-white flex items-center gap-5">
          <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm"><DollarSign size={36}/></div>
          <div>
            <p className="text-blue-100 font-medium text-sm mb-1 uppercase tracking-wider">Tổng giá trị tất cả đơn hàng</p>
            <h3 className="text-3xl font-bold">{formatPrice(stats.revenue.total)}</h3>
          </div>
        </div>

        {/* Doanh thu thực tế */}
        <div className="bg-gradient-to-r from-[#16A34A] to-[#15803D] p-6 rounded-xl shadow-md text-white flex items-center gap-5">
          <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm"><CreditCard size={36}/></div>
          <div>
            <p className="text-green-100 font-medium text-sm mb-1 uppercase tracking-wider">Doanh thu đã thu (Thành công)</p>
            <h3 className="text-3xl font-bold">{formatPrice(stats.revenue.success)}</h3>
          </div>
        </div>

        {/* Tiền chờ thanh toán */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-5">
          <div className="p-4 bg-orange-100 rounded-full text-orange-500"><AlertCircle size={32}/></div>
          <div>
            <p className="text-gray-500 font-semibold text-sm mb-1">ĐANG ĐỢI THANH TOÁN</p>
            <h3 className="text-2xl font-bold text-gray-900">{formatPrice(stats.revenue.pending)}</h3>
          </div>
        </div>

        {/* Tiền đơn hủy */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-5">
          <div className="p-4 bg-red-100 rounded-full text-red-500"><TrendingDown size={32}/></div>
          <div>
            <p className="text-gray-500 font-semibold text-sm mb-1">TIỀN TỪ ĐƠN ĐÃ HỦY</p>
            <h3 className="text-2xl font-bold text-gray-900">{formatPrice(stats.revenue.cancelled)}</h3>
          </div>
        </div>

      </div>

    </div>
  );
}