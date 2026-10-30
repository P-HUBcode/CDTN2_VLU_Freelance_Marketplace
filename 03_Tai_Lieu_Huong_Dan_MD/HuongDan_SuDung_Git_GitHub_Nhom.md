# HƯỚNG DẪN SỬ DỤNG GIT & GITHUB PHÂN CHIA NHÁNH NHÓM (BUỔI 6 & 7)
> **Đề tài:** Nền tảng quản lý freelance / marketplace việc làm part-time cho sinh viên Văn Lang  
> **Repository GitHub:** [https://github.com/P-HUBcode/CDTN2_VLU_Freelance_Marketplace](https://github.com/P-HUBcode/CDTN2_VLU_Freelance_Marketplace)  
> **Chủ sở hữu:** Nguyễn Minh Phú (GitHub: `@P-HUBcode`)  
> **Thành viên:** Hà Đại Vĩ  

---

## 1. CẤU TRÚC PHÂN CHIA NHÁNH (BRANCHING MODEL)

Hệ thống nhánh được thiết lập chuẩn theo quy định của ThS. Nguyễn Văn Trung (tránh xung đột code / merge conflict):

| Tên Branch trên GitHub | Người phụ trách | Vai trò & Nhiệm vụ code |
| :--- | :--- | :--- |
| **`main`** | **Cả nhóm** | Nhánh chính ổn định, dùng để nộp bài và demo trước giảng viên. Chỉ merge khi tính năng đã kiểm thử xong. |
| **`dev-phu-backend`** | **Nguyễn Minh Phú** | Lập trình Backend: Server Node.js/Express, API Auth JWT, CSDL MySQL, Middleware phân quyền 3 roles, API Duyệt tin. |
| **`dev-vi-frontend`** | **Hà Đại Vĩ** | Lập trình Frontend: Client ReactJS, TailwindCSS, Form Đăng ký/Đăng nhập, UI Tìm kiếm & Nộp hồ sơ 1-chạm, Quản lý ứng viên NTD. |

---

## 2. BƯỚC 1: NGUYỄN MINH PHÚ MỜI HÀ ĐẠI VĨ VÀO REPO GITHUB

Để bạn Vĩ có quyền đẩy code lên repo, bạn Phú cần cấp quyền cộng tác viên (Collaborator):
1. Truy cập vào link cài đặt repo: [https://github.com/P-HUBcode/CDTN2_VLU_Freelance_Marketplace/settings/access](https://github.com/P-HUBcode/CDTN2_VLU_Freelance_Marketplace/settings/access)
2. Nhấn nút **Add people** (màu xanh).
3. Nhập username GitHub hoặc email của bạn **Hà Đại Vĩ** $\rightarrow$ Nhấn **Add to this repository**.
4. Bạn Vĩ mở email (hoặc vào thông báo trên GitHub) nhấn **Accept invitation**.

---

## 3. HƯỚNG DẪN THAO TÁC HÀNG NGÀY CHO TỪNG BẠN

### 🔹 Dành cho Nguyễn Minh Phú (Backend):
Mỗi khi bắt đầu code backend:
```bash
# 1. Chuyển sang nhánh của mình
git checkout dev-phu-backend

# 2. Viết code backend trong thư mục server/ ...

# 3. Lưu và đẩy code lên GitHub (thực hiện ít nhất 2 lần/buổi)
git add .
git commit -m "feat(backend): hoan thanh api dang ky dang nhap JWT"
git push origin dev-phu-backend
```

---

### 🔹 Dành cho Hà Đại Vĩ (Frontend):
Trên máy tính của Vĩ:
```bash
# 1. Lần đầu tiên: Clone dự án về máy
git clone https://github.com/P-HUBcode/CDTN2_VLU_Freelance_Marketplace.git
cd CDTN2_VLU_Freelance_Marketplace

# 2. Chuyển sang nhánh frontend của mình
git checkout dev-vi-frontend

# 3. Viết code frontend trong thư mục client/ ...

# 4. Lưu và đẩy code lên GitHub
git add .
git commit -m "feat(frontend): dung giao dien form dang nhap va tim kiem viec"
git push origin dev-vi-frontend
```

---

## 4. CÁCH HỢP NHẤT CODE (MERGE VÀO MAIN) ĐỂ BÁO CÁO BUỔI 7
Khi hai bạn đã hoàn thành Sprint và muốn gộp code để chạy demo luồng hoàn chỉnh:
1. Vào mục Pull Requests: [https://github.com/P-HUBcode/CDTN2_VLU_Freelance_Marketplace/pulls](https://github.com/P-HUBcode/CDTN2_VLU_Freelance_Marketplace/pulls)
2. Nhấn **New pull request**:
   * Base: `main` $\leftarrow$ Compare: `dev-phu-backend` $\rightarrow$ Nhấn **Create pull request** $\rightarrow$ **Merge pull request**.
   * Base: `main` $\leftarrow$ Compare: `dev-vi-frontend` $\rightarrow$ Nhấn **Create pull request** $\rightarrow$ **Merge pull request**.
3. Cả 2 bạn kéo code mới nhất về:
   ```bash
   git checkout main
   git pull origin main
   ```
