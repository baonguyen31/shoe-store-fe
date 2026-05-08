// src/services/api.ts
const API_URL = "http://localhost:8080";

export const apiRequest = async (endpoint: string, method: string = "GET", body: unknown = null) => {
    // Lấy token từ sessionStorage
    let token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;
    
    // Làm sạch token (loại bỏ dấu ngoặc kép nếu có)
    if (token) {
        token = token.replace(/^["'](.+)["']$/, '$1').trim();
    }
    
    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(token && token !== "fail" ? { "Authorization": `Bearer ${token}` } : {}),
    };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : null,
        });
        
        // Nếu token hết hạn hoặc không hợp lệ (401 Unauthorized)
        if (response.status === 401) {
            if (typeof window !== "undefined") {
                sessionStorage.removeItem("token");
                sessionStorage.removeItem("user");
                sessionStorage.removeItem("customerName");
                sessionStorage.removeItem("employerId");
                // Phát sự kiện để Navbar cập nhật lại giao diện (ẩn tên người dùng)
                window.dispatchEvent(new Event("authUpdated"));
            }
        }

        const text = await response.text();
        if (!text) {
            return { ok: response.ok, status: response.status, json: () => Promise.resolve(null), text: () => Promise.resolve("") };
        }
        
        try {
            const data = JSON.parse(text);
            return { 
                ok: response.ok, 
                status: response.status, 
                json: () => Promise.resolve(data),
                text: () => Promise.resolve(text)
            };
        } catch {
            console.error("JSON Parse Error:", text);
            return { 
                ok: response.ok, 
                status: response.status, 
                json: () => { throw new Error("Invalid JSON response"); },
                text: () => Promise.resolve(text)
            };
        }
    } catch (error) {
        console.error("API Network Error:", error);
        // Trả về một đối tượng giả lập Response để tránh crash ứng dụng
        return { 
            ok: false, 
            status: 0, 
            json: () => Promise.resolve({ code: 500, message: "Không thể kết nối đến máy chủ" }),
            text: () => Promise.resolve("Network Error")
        };
    }
};
