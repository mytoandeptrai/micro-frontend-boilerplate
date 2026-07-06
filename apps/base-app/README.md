# apps/base-app

Scaffold chuẩn để tạo một remote MFE mới trong monorepo này — copy trực tiếp từ `apps/base-app`.

## Cách tạo remote mới

1. **Copy thư mục này** sang `apps/<ten-app-moi>` (ví dụ: `apps/reports-app`).
2. **Thay thế placeholder** trong toàn bộ file đã copy:
   - `baseApp` → tên dạng camelCase, ví dụ `reportsApp` (dùng làm MF container name và `@ops/<name>` package name)
   - `base-app` → tên dạng kebab-case, ví dụ `reports-app` (dùng làm `BrowserRouter basename` khi chạy standalone)
   - `3010` → port dev riêng, chưa bị app khác dùng (ví dụ `3011`)
   - Cập nhật biến env trong `.env.example`/`.env.local` (`BASE_APP_URL` → `REPORTS_APP_URL`)
3. **Đăng ký remote ở shell**:
   - Thêm vào `remotes` trong `apps/shell/rsbuild.config.ts`: `<tenApp>: '<tenApp>@${<TEN_APP>_URL}/mf-manifest.json'`
   - Thêm route lazy-load trong `apps/shell/src/App.tsx` trỏ tới `<tenApp>/App`
   - Thêm nav link tương ứng trong `apps/shell/src/layout/Sidebar.tsx`

Sau bước 2, `pnpm dev` trong thư mục app mới đã chạy được standalone ngay (chưa cần bước 3).

## Không có auth

Monorepo này không có backend, không có auth flow. Nếu bạn cần bảo vệ route hoặc phân quyền:

- Đặt logic auth (session, token, redirect) ở tầng `shell` — remote app không nên tự kiểm tra quyền.
- Pattern gợi ý: bọc route trong shell bằng một component kiểu `ProtectedRoute` đọc trạng thái đăng nhập từ Zustand store (`@ops/shared-core`) hoặc từ backend riêng của bạn.
- Không có code auth nào được implement sẵn trong template — đây chỉ là gợi ý hướng đi, tự triển khai theo nhu cầu thực tế của bạn.
