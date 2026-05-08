'use client';

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, CheckCircle2, Lock, ChevronLeft, ChevronRight, X, ArrowLeft, Edit, UserCog, User, Loader2, MapPin, Eye, EyeOff, RotateCw } from "lucide-react";

const USERS_PER_PAGE = 5;
const API_BASE_URL = "http://localhost:8080";

interface User {
  id: number;
  fullName: string;
  email?: string;
  username?: string;
  phone: string;
  city: string;
  ward: string;
  street: string;
  role: string;
  status: number;
  dateOfBirth: string;
  salary: number;
  password?: string;
  resetRequested?: boolean;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchName, setSearchName] = useState("");
  const [searchAccount, setSearchAccount] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRole, setFilterRole] = useState("customer");
  const [showPassword, setShowPassword] = useState(false); // Trạng thái ẩn/hiện pass

  const [appliedFilters, setAppliedFilters] = useState({
    name: "", account: "", status: "all", role: "customer"
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  
  const [currentUser, setCurrentUser] = useState<User>({ 
    id: 0, 
    fullName: "", 
    email: "", 
    phone: "", 
    city: "", 
    ward: "", 
    street: "", 
    password: "", // Dùng chung cho cả thêm mới và đổi mật khẩu khi sửa
    role: "customer", 
    status: 1, 
    dateOfBirth: "", 
    salary: 0 
  });

  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMsg(msg); 
    setToastType(type); 
    setTimeout(() => setToastMsg(""), 3000);
  };

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      const isStaffTab = appliedFilters.role === "staff" || appliedFilters.role === "admin";
      const endpoint = isStaffTab ? `${API_BASE_URL}/api/employers` : `${API_BASE_URL}/api/customers`;
      const params = new URLSearchParams({ page_no: "0", page_size: "1000" }).toString();

      const response = await fetch(`${endpoint}?${params}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && token !== "null" ? { "Authorization": `Bearer ${token}` } : {})
        }
      });

      if (!response.ok) { setUsers([]); return; }
      const json = await response.json();
      if (json.code === 200 && json.result) {
        const dataList = json.result.content || json.result;
        setUsers(Array.isArray(dataList) ? dataList : []); 
      } else { setUsers([]); }
    } catch { 
        setUsers([]);
    } finally { 
        setIsLoading(false); 
    }
  }, [appliedFilters]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSearchClick = () => {
    setAppliedFilters({ name: searchName, account: searchAccount, status: filterStatus, role: filterRole });
    setCurrentPage(1);
  };


  // Lọc và sắp xếp: user có resetRequested=true lên đầu
  const filteredData = users.filter(user => {
    const matchName = !appliedFilters.name || user.fullName?.toLowerCase().includes(appliedFilters.name.toLowerCase());
    const userEmail = (user.email || user.username || "").toLowerCase();
    const matchAccount = !appliedFilters.account || userEmail.includes(appliedFilters.account.toLowerCase());
    const matchStatus = appliedFilters.status === "all" || user.status === Number(appliedFilters.status);
    return matchName && matchAccount && matchStatus;
  }).sort((a, b) => {
    // true lên đầu
    if ((b.resetRequested ? 1 : 0) - (a.resetRequested ? 1 : 0) !== 0) {
      return (b.resetRequested ? 1 : 0) - (a.resetRequested ? 1 : 0);
    }
    return 0;
  });

  const totalPages = Math.ceil(filteredData.length / USERS_PER_PAGE);
  const startIndex = (currentPage - 1) * USERS_PER_PAGE;
  const paginatedUsers = filteredData.slice(startIndex, startIndex + USERS_PER_PAGE);

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = sessionStorage.getItem("token");
    const isStaff = currentUser.role === "staff" || currentUser.role === "admin";
    const endpoint = isStaff ? `${API_BASE_URL}/api/employers` : `${API_BASE_URL}/api/customers`;
    const method = modalMode === "add" ? "POST" : "PUT";
    const url = modalMode === "add" ? endpoint : `${endpoint}/${currentUser.id}`;

    const payload: Record<string, unknown> = {
      fullName: currentUser.fullName,
      email: currentUser.email,
      username: currentUser.email,
      phone: currentUser.phone,
      status: Number(currentUser.status),
      dateOfBirth: currentUser.dateOfBirth || null,
      city: currentUser.city || "",
      ward: currentUser.ward || "",
      street: currentUser.street || "",
    };

    // Chỉ gửi password nếu nó có giá trị (tránh ghi đè mật khẩu cũ thành rỗng khi sửa)
    if (currentUser.password) {
        payload.password = currentUser.password;
    }

    if (isStaff) payload.salary = currentUser.salary || 0;
    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (response.ok) {
        showToast(modalMode === "add" ? "Thêm thành công!" : "Cập nhật thành công!");
        fetchUsers(); 
        setIsModalOpen(false);
      } else { 
        showToast(result.message || "Lỗi dữ liệu", "error"); 
      }
    } catch { 
        showToast("Lỗi kết nối!", "error"); 
    }
  };

  const handleOpenAdd = () => {
    setModalMode("add");
    setShowPassword(false);
    setCurrentUser({ 
        id: 0, fullName: "", email: "", phone: "", 
        city: "", ward: "", street: "", 
        password: "", role: appliedFilters.role, status: 1, dateOfBirth: "", salary: 0 
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setModalMode("edit");
    setShowPassword(false);
    setCurrentUser({ 
        ...user, 
        email: user.email || user.username || "", 
        dateOfBirth: user.dateOfBirth || "", 
        city: user.city || "",
        ward: user.ward || "",
        street: user.street || "",
        password: "", // Reset trống khi mở form sửa
        salary: user.salary || 0, 
        role: user.role || appliedFilters.role 
    });
    setIsModalOpen(true);
  };

  const renderRoleBadge = (role: string) => {
    const r = role?.toLowerCase();
    if (r === 'admin' || r === 'staff' || r === 'employer') {
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-100 text-blue-700 text-xs font-bold"><UserCog size={12} /> Nhân viên</span>;
    }
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-gray-100 text-gray-700 text-xs font-bold"><User size={12} /> Khách hàng</span>;
  };

  const toggleStatus = async (user: User) => {
    const token = sessionStorage.getItem("token");
    const newStatus = user.status === 1 ? 0 : 1;
    const isStaff = appliedFilters.role === "staff" || appliedFilters.role === "admin";
    const endpoint = isStaff ? `${API_BASE_URL}/api/employers` : `${API_BASE_URL}/api/customers`;

    const payload = { 
      ...user, 
      status: newStatus, 
      username: user.email || user.username,
      ...(isStaff && { salary: user.salary || 0 })
    };

    try {
      const response = await fetch(`${endpoint}/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        showToast(newStatus === 0 ? "Đã khóa tài khoản!" : "Đã mở khóa thành công!");
        fetchUsers();
      } else {
        const errorData = await response.json();
        showToast(errorData.message || "Không thể cập nhật trạng thái", "error");
      }
    } catch { showToast("Lỗi kết nối máy chủ", "error"); }
  };

  const handleResetPassword = async (user: User) => {
    const token = sessionStorage.getItem("token");
    const isStaff = appliedFilters.role === "staff" || appliedFilters.role === "admin";
    const endpoint = isStaff ? `${API_BASE_URL}/api/employers` : `${API_BASE_URL}/api/customers`;

    try {
      const response = await fetch(`${endpoint}/${user.id}/reset-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        showToast("Mật khẩu đã được reset thành công!", "success");
        fetchUsers();
      } else {
        const errorData = await response.json();
        showToast(errorData.message || "Không thể reset mật khẩu", "error");
      }
    } catch { showToast("Lỗi kết nối máy chủ", "error"); }
  };

  return (
    <div className="relative min-h-[80vh] font-sans pb-10">
      {/* Toast Notification */}
      {toastMsg && (
        <div className={`fixed top-6 right-6 bg-white border-l-4 shadow-xl px-6 py-4 rounded-lg flex items-center gap-3 z-[60] animate-in slide-in-from-right-8 ${toastType === 'success' ? 'border-green-500' : 'border-red-500'}`}>
          {toastType === 'success' ? <CheckCircle2 className="text-green-500" size={24} /> : <X className="text-red-500" size={24} />}
          <span className="font-medium text-gray-800">{toastMsg}</span>
        </div>
      )}

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-4xl my-8 flex flex-col gap-4 animate-in zoom-in-95">
            <div className="bg-white rounded-xl shadow-sm px-6 py-4 border border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-blue-600 border-l-4 border-blue-600 pl-3">
                {modalMode === "add" ? "Thêm tài khoản người dùng" : "Chỉnh sửa thông tin"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full"><X size={24} /></button>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
              <form onSubmit={handleSaveUser} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {/* Thông tin cơ bản */}
                  <div><label className="block text-sm font-semibold text-gray-800 mb-2">Họ tên <span className="text-red-500">*</span></label><input required type="text" value={currentUser.fullName} onChange={(e) => setCurrentUser({...currentUser, fullName: e.target.value})} className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all" /></div>
                  <div><label className="block text-sm font-semibold text-gray-800 mb-2">Email <span className="text-red-500">*</span></label><input required type="email" value={currentUser.email} onChange={(e) => setCurrentUser({...currentUser, email: e.target.value})} className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all" /></div>
                  <div><label className="block text-sm font-semibold text-gray-800 mb-2">Số điện thoại <span className="text-red-500">*</span></label><input required type="tel" value={currentUser.phone} onChange={(e) => setCurrentUser({...currentUser, phone: e.target.value})} className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all" /></div>
                  <div><label className="block text-sm font-semibold text-gray-800 mb-2">Ngày sinh</label><input type="date" value={currentUser.dateOfBirth || ""} onChange={(e) => setCurrentUser({...currentUser, dateOfBirth: e.target.value})} className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all" /></div>
                  
                  {/* PHẦN ĐỊA CHỈ */}
                  <div className="md:col-span-2 pt-4 border-t border-gray-50">
                    <label className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase mb-4 tracking-widest"><MapPin size={14}/> Địa chỉ chi tiết</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Tỉnh / Thành phố</label>
                            <input required type="text" placeholder="VD: Hà Nội" value={currentUser.city} onChange={(e) => setCurrentUser({...currentUser, city: e.target.value})} className="w-full border border-gray-300 text-gray-900 rounded-lg px-3 py-2 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none" />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Quận / Huyện</label>
                            <input required type="text" placeholder="VD: Cầu Giấy" value={currentUser.ward} onChange={(e) => setCurrentUser({...currentUser, ward: e.target.value})} className="w-full border border-gray-300 text-gray-900 rounded-lg px-3 py-2 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none" />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Số nhà, tên đường</label>
                            <input required type="text" placeholder="VD: 123 Đường Láng" value={currentUser.street} onChange={(e) => setCurrentUser({...currentUser, street: e.target.value})} className="w-full border border-gray-300 text-gray-900 rounded-lg px-3 py-2 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none" />
                        </div>
                    </div>
                  </div>

                  {/* LƯƠNG */}
                  {(currentUser.role === "staff" || currentUser.role === "admin") && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-800 mb-2">Mức lương (VNĐ) <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <input required type="number" value={currentUser.salary || 0} onChange={(e) => setCurrentUser({...currentUser, salary: Number(e.target.value)})} className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 pl-12 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none font-bold" />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold border-r pr-2 border-gray-300">₫</span>
                      </div>
                    </div>
                  )}

                  {/* MẬT KHẨU - Hiện cho cả Add và Edit */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Mật khẩu {modalMode === "add" ? <span className="text-red-500">*</span> : <span className="text-gray-400 font-normal italic text-xs">(Để trống nếu không muốn đổi)</span>}
                    </label>
                    <div className="relative">
                        <input 
                            required={modalMode === "add"} 
                            type={showPassword ? "text" : "password"} 
                            value={currentUser.password} 
                            placeholder={modalMode === "edit" ? "Nhập mật khẩu mới..." : "Nhập mật khẩu..."}
                            onChange={(e) => setCurrentUser({...currentUser, password: e.target.value})} 
                            className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 pr-12 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none" 
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                  </div>

                  {modalMode === "add" && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">Vai trò <span className="text-red-500">*</span></label>
                      <select required value={currentUser.role} onChange={(e) => setCurrentUser({...currentUser, role: e.target.value})} className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none bg-white font-medium">
                        <option value="customer">Khách hàng</option>
                        <option value="staff">Nhân viên</option>
                      </select>
                    </div>
                  )}

                  <div className={modalMode === "edit" ? "md:col-span-2" : ""}>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Trạng thái <span className="text-red-500">*</span></label>
                    <select required value={currentUser.status} onChange={(e) => setCurrentUser({...currentUser, status: Number(e.target.value)})} className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none bg-white font-medium">
                      <option value={1}>🟢 Hoạt động</option>
                      <option value={0}>🔴 Bị khóa</option>
                    </select>
                  </div>
                </div>

                <div className="pt-8 flex justify-end gap-4 border-t border-gray-100 mt-8">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-semibold transition flex items-center gap-2"><ArrowLeft size={18} /> Quay về</button>
                  <button type="submit" className="px-8 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-md font-semibold transition flex items-center gap-2">
                    {modalMode === "add" ? <Plus size={18} /> : <CheckCircle2 size={18} />}
                    {modalMode === "add" ? "Thêm tài khoản" : "Lưu thay đổi"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar & Search Table giữ nguyên như cũ */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">Quản lý người dùng</h1>
        <button onClick={handleOpenAdd} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow-sm hover:bg-blue-700 transition flex items-center gap-2 font-medium"><Plus size={18} /> Thêm tài khoản</button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div><label className="block text-sm font-bold text-gray-900 mb-1.5">Tìm theo họ tên</label><input type="text" placeholder="Nhập họ tên..." value={searchName} onChange={(e) => setSearchName(e.target.value)} className="w-full border-2 border-gray-300 text-gray-900 placeholder-gray-400 rounded-lg px-4 py-2.5 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none shadow-sm transition-all font-medium" /></div>
          <div><label className="block text-sm font-bold text-gray-900 mb-1.5">Tìm theo email</label><input type="text" placeholder="Nhập email..." value={searchAccount} onChange={(e) => setSearchAccount(e.target.value)} className="w-full border-2 border-gray-300 text-gray-900 placeholder-gray-400 rounded-lg px-4 py-2.5 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none shadow-sm transition-all font-medium" /></div>
          <div><label className="block text-sm font-bold text-gray-900 mb-1.5">Vai trò</label><select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="w-full border-2 border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none shadow-sm transition-all bg-white font-bold"><option value="customer">Khách hàng</option><option value="staff">Nhân viên</option></select></div>
          <div><label className="block text-sm font-bold text-gray-900 mb-1.5">Trạng thái</label><select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full border-2 border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none shadow-sm transition-all bg-white font-bold"><option value="all">Tất cả</option><option value={1}>Hoạt động</option><option value={0}>Bị khóa</option></select></div>
          <div><button onClick={handleSearchClick} className="bg-[#22C55E] text-white px-5 py-2.5 rounded-lg shadow-sm hover:bg-[#16A34A] transition flex items-center justify-center gap-2 font-black w-full md:w-auto"><Search size={18} /> Tìm kiếm</button></div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8 min-h-[400px] relative">
        {isLoading && <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>}
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-blue-600 text-white text-sm font-black uppercase tracking-wide">
                <th className="px-4 py-4">STT</th>
                <th className="px-4 py-4">HỌ VÀ TÊN</th>
                <th className="px-4 py-4">EMAIL</th>
                <th className="px-4 py-4">SỐ ĐIỆN THOẠI</th>
                <th className="px-4 py-4">VAI TRÒ</th>
                {(appliedFilters.role === "staff" || appliedFilters.role === "admin") && (
                  <th className="px-4 py-4 text-yellow-300">LƯƠNG</th>
                )}
                <th className="px-4 py-4">RESET?</th>
                <th className="px-4 py-4">TRẠNG THÁI</th>
                <th className="px-4 py-4">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {!isLoading && paginatedUsers.map((user, index) => (
                <tr key={user.id} className={`hover:bg-blue-50/50 transition-colors ${user.resetRequested ? 'bg-yellow-50' : ''}`}>
                  <td className="px-4 py-4 font-medium text-slate-700">{startIndex + index + 1}</td>
                  <td className="px-4 py-4 font-medium text-slate-900">{user.fullName}</td>
                  <td className="px-4 py-4 font-medium text-slate-800">{user.email || user.username}</td>
                  <td className="px-4 py-4 font-medium text-slate-700">{user.phone}</td>
                  <td className="px-4 py-4 font-medium">{renderRoleBadge(user.role || appliedFilters.role)}</td>
                  {(appliedFilters.role === "staff" || appliedFilters.role === "admin") && (
                    <td className="px-4 py-4 font-medium text-blue-700">{user.salary?.toLocaleString('vi-VN')} ₫</td>
                  )}
                  <td className="px-4 py-4 font-medium">
                    {user.resetRequested ? (
                      <span className="bg-yellow-100 text-yellow-800 px-2.5 py-1 rounded font-medium text-xs border border-yellow-300 inline-flex items-center gap-1">Yêu cầu</span>
                    ) : (
                      <span className="bg-gray-100 text-gray-500 px-2.5 py-1 rounded font-medium text-xs border border-gray-300 inline-flex items-center gap-1">Không</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {user.status === 1 ? (
                      <span className="bg-green-50 text-green-800 px-2.5 py-1 rounded font-medium text-xs border border-green-300 inline-flex items-center gap-1"><CheckCircle2 size={12}/> Hoạt động</span>
                    ) : (
                      <span className="bg-red-50 text-red-700 px-2.5 py-1 rounded font-medium text-xs border border-red-300 inline-flex items-center gap-1"><Lock size={12}/> Đã khóa</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleOpenEdit(user)} className="bg-blue-50 text-blue-600 p-2 rounded-lg hover:bg-blue-100 transition" title="Chỉnh sửa"><Edit size={16}/></button>
                      {user.resetRequested && (
                        <button onClick={() => handleResetPassword(user)} className="bg-yellow-50 text-yellow-600 p-2 rounded-lg hover:bg-yellow-100 transition" title="Reset mật khẩu"><RotateCw size={16}/></button>
                      )}
                      <button onClick={() => toggleStatus(user)} className={`px-3 py-1.5 rounded-lg text-white font-medium text-xs transition ${user.status === 1 ? "bg-red-500 hover:bg-red-600" : "bg-gray-600 hover:bg-gray-700"}`}>{user.status === 1 ? "Khóa" : "Mở khóa"}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50 transition"
          >
            <ChevronLeft size={20} />
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-10 h-10 rounded-lg border transition ${currentPage === i + 1 ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 hover:bg-gray-50'}`}
            >
              {i + 1}
            </button>
          ))}
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50 transition"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
