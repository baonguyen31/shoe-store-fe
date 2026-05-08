import Cart from "../../components/Cart";
import Navbar from "../../components/Navbar";

export default function CartPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navbar xuất hiện ở trên cùng */}
      <Navbar /> 
      
      {/* Nội dung giỏ hàng, cách ra một khoảng để không bị Navbar đè lên */}
      <div className="pt-20"> 
        <Cart />
      </div>
    </main>
  );
}