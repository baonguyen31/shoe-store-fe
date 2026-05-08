"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  RefreshCcw,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  Truck,
} from "lucide-react";
import { apiRequest } from "@/services/app";

const ORDERS_PER_PAGE = 5;

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface Order {
  id: number;
  orderCode: string;
  customerName: string;
  totalProducts: number;
  phone: string;
  email: string;
  address: string;
  orderDate: string;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  items: OrderItem[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  // PHỤC HỒI BIẾN BIẾN LỖI: filterStatus
  const [filterStatus, setFilterStatus] = useState("all");

  const [appliedFilters, setAppliedFilters] = useState({
    fromDate: "",
    toDate: "",
    status: "all", // Bổ sung status vào bộ lọc đã áp dụng
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        page_no: (currentPage - 1).toString(),
        page_size: ORDERS_PER_PAGE.toString(),
        sortBy: "id",
        sortDir: "desc",
        ...(appliedFilters.fromDate ? { fromDate: appliedFilters.fromDate } : {}),
        ...(appliedFilters.toDate ? { toDate: appliedFilters.toDate } : {}),
        ...(appliedFilters.status && appliedFilters.status !== "all" ? { status: appliedFilters.status } : {}),
      }).toString();

      const response = await apiRequest(`/api/orders?${query}`);
      const result = await response.json();

      if (result && result.code === 200) {
        const mappedOrders = result.result.content.map((item: { 
          order: { 
            id: number, 
            customer?: { fullName: string, phone: string, email: string, street: string, ward: string, city: string }, 
            createdAt: string, 
            totalPrice: number, 
            method: string, 
            status: string 
          }, 
          details?: { product?: { name: string }, quantity: number, cost: number, total: number }[] 
        }) => {
          const ord = item.order;
          return {
            id: ord.id,
            orderCode: `#ORD-${String(ord.id).padStart(3, '0')}`,
            customerName: ord.customer?.fullName || "Khách hàng",
            totalProducts: item.details?.length || 0,
            phone: ord.customer?.phone || "N/A",
            email: ord.customer?.email || "N/A",
            address: `${ord.customer?.street || ""}, ${ord.customer?.ward || ""}, ${ord.customer?.city || ""}`.replace(/^, , /, ""),
            orderDate: ord.createdAt ? ord.createdAt.split('T')[0] : "",
            totalAmount: ord.totalPrice,
            paymentMethod: ord.method || "COD",
            status: ord.status, // PENDING, CONFIRMED, etc.
            items: item.details?.map((dt) => ({
              name: dt.product?.name || "Sản phẩm",
              quantity: dt.quantity,
              price: dt.cost,
              total: dt.total
            })) || []
          };
        });
        setOrders(mappedOrders);
        setTotalOrders(result.result.total);
      }
    } catch {
      showToast("Lỗi kết nối máy chủ!", "error");
    } finally {
      setIsLoading(false);
    }
  }, [appliedFilters, currentPage]);

  useEffect(() => {
    const checkUser = async () => {
      const token = sessionStorage.getItem("token");
      const empId = sessionStorage.getItem("employerId");
      if (token && !empId) {
        try {
          const res = await apiRequest("/api/auth/me");
          const data = await res.json();
          if (data && data.code === 200 && data.result?.id) {
            sessionStorage.setItem("employerId", data.result.id.toString());
          }
        } catch {
          // ignore
        }
      }
    };
    checkUser();
    fetchOrders();
  }, [fetchOrders]);

  // HÀM CẬP NHẬT TRẠNG THÁI (Tiến sang trạng thái tiếp theo)
  const handleAdvanceStatus = async (nextStatus: string) => {
    if (!selectedOrder) return;

    if (nextStatus === "CANCELLED") {
      if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?"))
        return;
    }
    
    const empId = sessionStorage.getItem("employerId");
    if (!empId) {
      showToast("Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại!", "error");
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest("/api/orders/status", "PUT", {
        orderId: selectedOrder.id,
        orderStatusNext: nextStatus,
        employerId: Number(empId),
      });
      const result = await response.json();
      if (result && result.code === 200) {
        showToast("Cập nhật trạng thái thành công", "success");
        setSelectedOrder({ ...selectedOrder, status: nextStatus });
        fetchOrders();
      } else {
        showToast(result?.message || "Lỗi khi cập nhật", "error");
      }
    } catch {
      showToast("Lỗi khi cập nhật trạng thái!", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const getNextStatusAction = (status: string) => {
    switch (status) {
      case "PENDING":
        return { label: "Xác nhận đơn hàng", next: "CONFIRMED", color: "bg-blue-600 hover:bg-blue-700" };
      case "CONFIRMED":
        return { label: "Giao hàng cho đơn vị vận chuyển", next: "SHIPPING", color: "bg-yellow-600 hover:bg-yellow-700" };
      case "SHIPPING":
        return { label: "Hoàn thành đơn hàng", next: "DELIVERED", color: "bg-green-600 hover:bg-green-700" };
      default:
        return null;
    }
  };

  const handleSearchClick = () => {
    setAppliedFilters({ fromDate, toDate, status: filterStatus });
    setCurrentPage(1);
  };

  // PHỤC HỒI HÀM RESET BỊ THIẾU
  const handleResetFilters = () => {
    setFromDate("");
    setToDate("");
    setFilterStatus("all");
    setAppliedFilters({ fromDate: "", toDate: "", status: "all" });
  };

  const handleOpenDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN").format(price) + " đ";

  const formatDateDisplay = (isoDate: string) => {
    if (!isoDate) return "";
    const [year, month, day] = isoDate.split("-");
    return `${day}-${month}-${year}`;
  };

  const renderStatusBadge = (status: string, forModal: boolean = false) => {
    const baseClass = forModal
      ? "inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-sm font-bold"
      : "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold tracking-wide";

    switch (status) {
      case "PENDING":
        return (
          <span
            className={`${baseClass} border-orange-400 text-orange-600 bg-orange-50`}
          >
            <Clock size={forModal ? 16 : 14} /> Chờ xác nhận
          </span>
        );
      case "CONFIRMED":
        return (
          <span
            className={`${baseClass} border-blue-400 text-blue-600 bg-blue-50`}
          >
            <CheckCircle2 size={forModal ? 16 : 14} /> Đã xác nhận
          </span>
        );
      case "SHIPPING":
        return (
          <span
            className={`${baseClass} border-yellow-400 text-yellow-600 bg-yellow-50`}
          >
            <Truck size={forModal ? 16 : 14} /> Đang giao
          </span>
        );
      case "DELIVERED":
        return (
          <span
            className={`${baseClass} border-green-500 text-green-600 bg-green-50`}
          >
            <CheckCircle2 size={forModal ? 16 : 14} /> Đã giao
          </span>
        );
      case "CANCELLED":
        return (
          <span
            className={`${baseClass} border-red-500 text-red-600 bg-red-50`}
          >
            <XCircle size={forModal ? 16 : 14} /> Đã hủy
          </span>
        );
      default:
        return (
          <span className={`${baseClass} border-gray-400 text-gray-600 bg-gray-50`}>
            {status}
          </span>
        );
    }
  };

  const totalPages = Math.ceil(totalOrders / ORDERS_PER_PAGE);
  const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
  const paginatedOrders = orders; // Dữ liệu từ API đã là trang hiện tại

  return (
    <div className="relative min-h-[80vh] font-sans pb-10 bg-gray-50">
      {toastMsg && (
        <div
          className={`fixed top-6 right-6 bg-white border-l-4 shadow-xl px-6 py-4 rounded-lg flex items-center gap-3 z-[100] animate-in slide-in-from-right-8 ${toastType === "success" ? "border-green-500" : "border-red-500"}`}
        >
          {toastType === "success" ? (
            <CheckCircle2 className="text-green-500" size={24} />
          ) : (
            <XCircle className="text-red-500" size={24} />
          )}
          <span className="font-medium text-gray-800">{toastMsg}</span>
        </div>
      )}

      {/* MODAL CHI TIẾT ĐƠN HÀNG */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-gray-500/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl my-8 animate-in zoom-in-95 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
              <h2 className="text-lg font-bold text-blue-600">
                Chi tiết đơn hàng
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-red-500 transition p-1"
              >
                <X size={24} />
              </button>
            </div>
            <div className="bg-blue-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white">
                Thông tin đơn hàng {selectedOrder.orderCode}
              </h3>
            </div>
            <div className="p-8 space-y-8 bg-white text-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h4 className="font-bold border-b pb-2 mb-3">Khách hàng</h4>
                  <p>
                    <span className="text-gray-500">Họ tên:</span>{" "}
                    <strong>{selectedOrder.customerName}</strong>
                  </p>
                  <p>
                    <span className="text-gray-500">SĐT:</span>{" "}
                    {selectedOrder.phone}
                  </p>
                  <p>
                    <span className="text-gray-500">Email:</span>{" "}
                    {selectedOrder.email || "N/A"}
                  </p>
                </div>
                <div>
                  <h4 className="font-bold border-b pb-2 mb-3">Vận chuyển</h4>
                  <p className="text-gray-500">Địa chỉ giao hàng:</p>
                  <p className="font-medium">
                    {selectedOrder.address || "Chưa cập nhật địa chỉ"}
                  </p>
                </div>
                <div>
                  <h4 className="font-bold border-b pb-2 mb-3">Thanh toán</h4>
                  <p>
                    <span className="text-gray-500">Phương thức:</span>{" "}
                    <strong>{selectedOrder.paymentMethod}</strong>
                  </p>
                  <p>
                    <span className="text-gray-500">Trạng thái:</span>{" "}
                    {renderStatusBadge(selectedOrder.status, true)}
                  </p>
                </div>
              </div>

              {/* BẢNG SẢN PHẨM TRONG MODAL */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-center text-sm">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="px-4 py-3">STT</th>
                      <th className="px-4 py-3 text-left">Tên sản phẩm</th>
                      <th className="px-4 py-3">Số lượng</th>
                      <th className="px-4 py-3">Đơn giá</th>
                      <th className="px-4 py-3 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {selectedOrder.items?.map((item: OrderItem, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-4">{idx + 1}</td>
                        <td className="px-4 py-4 text-left font-medium">
                          {item.name}
                        </td>
                        <td className="px-4 py-4">{item.quantity}</td>
                        <td className="px-4 py-4">{formatPrice(item.price)}</td>
                        <td className="px-4 py-4 font-bold text-red-500 text-right">
                          {formatPrice(item.total)}
                        </td>
                      </tr>
                    )) || (
                      <tr>
                        <td colSpan={5} className="py-8 text-gray-400 italic">
                          Không có dữ liệu sản phẩm
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-t pt-8">
                <div className="flex flex-wrap gap-3">
                  {getNextStatusAction(selectedOrder.status) && (
                    <button
                      onClick={() => handleAdvanceStatus(getNextStatusAction(selectedOrder.status)!.next)}
                      className={`${getNextStatusAction(selectedOrder.status)!.color} text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-md transition-all active:scale-95`}
                    >
                      <CheckCircle2 size={18} /> {getNextStatusAction(selectedOrder.status)!.label}
                    </button>
                  )}
                  
                  {(selectedOrder.status === "PENDING" || selectedOrder.status === "CONFIRMED") && (
                    <button
                      onClick={() => handleAdvanceStatus("CANCELLED")}
                      className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all active:scale-95"
                    >
                      <XCircle size={18} /> Hủy đơn hàng
                    </button>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-gray-500 font-medium">
                    Tổng tiền thanh toán:
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatPrice(selectedOrder.totalAmount)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GIAO DIỆN CHÍNH */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6 mt-6 mx-6">
        <h1 className="text-xl font-bold text-blue-600 uppercase">
          Quản lý đơn hàng
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6 mx-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Từ ngày</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full border-2 rounded-lg px-4 py-2.5 outline-none focus:border-blue-600 font-black text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Đến ngày</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full border-2 rounded-lg px-4 py-2.5 outline-none focus:border-blue-600 font-black text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Tình trạng đơn hàng
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border-2 rounded-lg px-4 py-2.5 outline-none bg-white font-black text-gray-900"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="PENDING">Chờ xác nhận</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="SHIPPING">Đang giao</option>
              <option value="DELIVERED">Đã giao</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSearchClick}
            className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-black flex items-center gap-2 hover:bg-green-700 transition"
          >
            <Search size={18} /> Tìm kiếm
          </button>
          <button
            onClick={handleResetFilters}
            className="bg-gray-600 text-white px-6 py-2.5 rounded-lg font-black flex items-center gap-2 hover:bg-gray-700 transition"
          >
            <RefreshCcw size={18} /> Đặt lại
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden mb-8 min-h-[400px] relative mx-6">
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center backdrop-blur-[1px]">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <span className="font-bold text-gray-600">
                Đang tải dữ liệu...
              </span>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-center">
            <thead>
              <tr className="bg-blue-600 text-white text-sm font-black uppercase">
                <th className="px-4 py-4">STT</th>
                <th className="px-4 py-4">MÃ ĐƠN</th>
                <th className="px-4 py-4 text-left">KHÁCH HÀNG</th>
                <th className="px-4 py-4">SỐ ĐIỆN THOẠI</th>
                <th className="px-4 py-4">NGÀY ĐẶT</th>
                <th className="px-4 py-4">TỔNG TIỀN</th>
                <th className="px-4 py-4">THANH TOÁN</th>
                <th className="px-4 py-4">TRẠNG THÁI</th>
                <th className="px-4 py-4">CHI TIẾT</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm text-slate-900 font-medium">
              {!isLoading && paginatedOrders.length > 0
                ? paginatedOrders.map((order, index) => (
                    <tr
                      key={order.id}
                      className="hover:bg-blue-50/50 transition-colors"
                    >
                      <td className="px-4 py-5 font-medium text-slate-700">{startIndex + index + 1}</td>
                      <td className="px-4 py-5 font-bold text-slate-900">{order.orderCode}</td>
                      <td className="px-4 py-5 text-left">
                        <span className="font-bold block text-slate-900">
                          {order.customerName}
                        </span>
                        <span className="text-slate-500 text-xs font-medium">
                          {order.totalProducts} sản phẩm
                        </span>
                      </td>
                      <td className="px-4 py-5 font-medium text-slate-700">{order.phone}</td>
                      <td className="px-4 py-5 font-medium">
                        {formatDateDisplay(order.orderDate)}
                      </td>
                      <td className="px-4 py-5 font-bold text-red-600">
                        {formatPrice(order.totalAmount)}
                      </td>
                      <td className="px-4 py-5 font-medium text-slate-800">
                        {order.paymentMethod}
                      </td>
                      <td className="px-4 py-5">
                        {renderStatusBadge(order.status)}
                      </td>
                      <td className="px-4 py-5">
                        <button
                          onClick={() => handleOpenDetails(order)}
                          className="bg-blue-600 text-white px-4 py-1.5 rounded shadow-sm font-medium flex items-center gap-1.5 mx-auto"
                        >
                          <Eye size={16} /> Xem
                        </button>
                      </td>
                    </tr>
                  ))
                : !isLoading && (
                    <tr>
                      <td colSpan={9} className="py-12 text-gray-500">
                        Không tìm thấy đơn hàng nào.
                      </td>
                    </tr>
                  )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pb-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="w-9 h-9 flex items-center justify-center border rounded-lg bg-white disabled:opacity-50"
          >
            <ChevronLeft size={18} />
          </button>
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={`w-9 h-9 rounded-lg font-bold border ${currentPage === index + 1 ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300"}`}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="w-9 h-9 flex items-center justify-center border rounded-lg bg-white disabled:opacity-50"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
