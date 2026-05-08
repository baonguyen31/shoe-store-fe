# TMDT & UD Shop - Dự án Thương mại điện tử (ShoesStore)

Dự án này là một ứng dụng thương mại điện tử giày dép hoàn chỉnh bao gồm Backend (Spring Boot) và Frontend (Next.js 15). Ứng dụng được tối ưu hóa cho hiệu suất, bảo mật và trải nghiệm người dùng hiện đại.

## 📌 Cấu trúc dự án

- **backend/**: Chứa mã nguồn của máy chủ, được xây dựng bằng Spring Boot.
- **frontend/**: Chứa mã nguồn của giao diện người dùng, được xây dựng bằng Next.js 15 (App Router).
- **database/**: Chứa các script SQL để khởi tạo cấu trúc bảng và dữ liệu mẫu (MySQL/XAMPP).
- **docs/**: Chứa tài liệu hướng dẫn và báo cáo chi tiết của dự án.

## 🚀 Công nghệ sử dụng

### Backend
- **Ngôn ngữ:** Java 21
- **Framework:** Spring Boot 3.4.x
- **Bảo mật:** Spring Security & JWT (JSON Web Token)
- **Database:** MySQL 8.0 / MariaDB
- **Công cụ hỗ trợ:** Lombok, MapStruct, Maven, JPA/Hibernate

### Frontend
- **Framework:** Next.js 15.1.6 (React 19)
- **Kiến trúc:** App Router, Server Components & Client Components
- **Styling:** Tailwind CSS 4 (Tối ưu hóa hiệu năng styling)
- **UI Components:** Lucide React Icons, Framer Motion (Animations)
- **Ngôn ngữ:** TypeScript (Type-safe codebase)

## 🛠 Hướng dẫn thiết lập

### 1. Chuẩn bị
- Cài đặt **JDK 21**
- Cài đặt **Node.js** (v20.x trở lên)
- Cài đặt **Maven**
- Cài đặt **XAMPP** hoặc **MySQL Server**

### 2. Thiết lập Database
1. Mở MySQL (XAMPP Control Panel).
2. Tạo database mới: `cuahang_db`.
3. Chạy file `backend/database/sql/database_schema.sql` để tạo cấu trúc.
4. Chạy file `backend/database/sql/database_seeder.sql` để nạp dữ liệu mẫu.

### 3. Cấu hình & Chạy Backend
1. Kiểm tra file `backend/src/main/resources/application.yaml` để đảm bảo thông tin kết nối đúng.
2. Mở terminal tại thư mục `backend`:
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

### 4. Thiết lập & Chạy Frontend
1. Mở terminal tại thư mục `frontend`.
2. Cài đặt thư viện:
   ```bash
   npm install
   ```
3. Chạy server phát triển:
   ```bash
   npm run dev
   ```
4. Build bản chính thức (Production):
   ```bash
   npm run build
   ```

## 📋 Tính năng nổi bật

### Người dùng (Customer)
- **Trải nghiệm mua sắm:** Danh mục sản phẩm đa dạng, lọc theo thương hiệu, giá và màu sắc.
- **Giỏ hàng thông minh:** Cập nhật số lượng thời gian thực, lưu trữ đồng bộ với server.
- **Thanh toán linh hoạt:** Tích hợp thanh toán **COD** và **Ví MoMo** (có hệ thống xác nhận tự động).
- **Quản lý đơn hàng:** Theo dõi trạng thái đơn hàng, lịch sử mua hàng chi tiết.

### Quản trị (Admin Dashboard)
- **Quản lý sản phẩm:** Thêm mới, chỉnh sửa thông tin, quản lý biến thể (Size/Màu) và hình ảnh.
- **Quản lý đơn hàng:** Tiếp nhận, xác nhận và cập nhật trạng thái giao hàng.
- **Quản lý người dùng:** Phân quyền nhân viên (Staff) và quản lý khách hàng.

## ✨ Cập nhật mới nhất
- **Dữ liệu mẫu (Seed Data):** Cập nhật giá sản phẩm về mức thực tế (~100.000 VND) và bổ sung đầy đủ các mốc thời gian `created_at` cho toàn bộ hệ thống.
- **Tính nhất quán dữ liệu:** Đồng bộ hóa logic giá giữa Sản phẩm - Đơn hàng - Chi tiết đơn hàng trong database seeder.
- **Tối ưu hóa hiệu suất:** Sử dụng Next.js `<Image />` component để giảm thời gian tải ảnh (LCP).
- **Type Safety:** Loại bỏ hoàn toàn `any` types, chuyển sang hệ thống Interface chặt chẽ.
- **Next.js 15 Core:** Áp dụng Suspense Boundaries cho tìm kiếm và thanh toán, tương thích hoàn toàn với Next.js 15.
- **UI/UX:** Cải tiến bộ lọc (Sidebar Drawer), đơn giản hóa quy trình nhập địa chỉ thanh toán.

---
*Dự án được phát triển bởi nhóm TMDT & UD. Mọi thắc mắc vui lòng liên hệ qua issue của repo.*
