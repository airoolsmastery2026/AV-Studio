# Hướng Dẫn Triển Khai Ứng Dụng Lên Vercel (GitHub CI/CD)

Đây là quy trình để đưa ứng dụng **Affiliate Video Studio** lên môi trường online chạy ổn định 24/7 và dễ dàng cập nhật code từ Google AI Studio.

## Phần 1: Chuẩn Bị Code (Tại Máy Tính Của Bạn)

1.  **Cài đặt Node.js:** Hãy chắc chắn bạn đã cài đặt [Node.js](https://nodejs.org/).
2.  **Tạo thư mục dự án:** Tạo một thư mục mới trên máy tính (ví dụ: `affiliate-studio`) và copy toàn bộ các file code hiện tại vào đó.
3.  **Cài đặt thư viện:** Mở Terminal (Command Prompt) tại thư mục đó và chạy lệnh:
    ```bash
    npm install
    ```
    *(Lệnh này sẽ đọc file `package.json` mình vừa tạo và tải các thư viện React, Vite, Google GenAI...)*.

4.  **Chạy thử:**
    ```bash
    npm run dev
    ```
    Truy cập `http://localhost:3000` để đảm bảo web chạy tốt dưới máy local.

## Phần 2: Đẩy Code Lên GitHub

1.  **Tạo Repository:** Truy cập [GitHub](https://github.com/) và tạo một Repository mới (ví dụ: `affiliate-video-studio`). Chọn chế độ **Private** nếu bạn muốn bảo mật code.
2.  **Push Code:** Tại Terminal của thư mục dự án:
    ```bash
    git init
    git add .
    git commit -m "Initial commit - Auto Recon Center"
    git branch -M main
    git remote add origin https://github.com/USERNAME/affiliate-video-studio.git
    git push -u origin main
    ```
    *(Thay `USERNAME` bằng tên GitHub của bạn)*.

## Phần 3: Kết Nối Vercel (Deploy)

1.  Truy cập [Vercel Dashboard](https://vercel.com/).
2.  Nhấn **"Add New..."** -> **"Project"**.
3.  Chọn **"Continue with GitHub"** và chọn repository `affiliate-video-studio` bạn vừa tạo.
4.  Tại màn hình **Configure Project**:
    *   **Framework Preset:** Vercel thường tự nhận diện là **Vite**. Nếu không, hãy chọn `Vite`.
    *   **Root Directory:** Để mặc định `./`.
    *   **Build Command:** `npm run build`.
    *   **Output Directory:** `dist`.
5.  Nhấn **Deploy**.

Sau khoảng 1-2 phút, Vercel sẽ cung cấp cho bạn một đường link (ví dụ: