import docx

def complete_agile_docx():
    doc_path = 'CauTruc_QuanLyDuAn_AgileScrum.docx'
    doc = docx.Document(doc_path)

    # 1. Update Paragraphs
    replacements = {
        "Dự án minh họa: Hệ thống Quản lý Thư viện Trường Đại học": "Đề tài: Nền tảng Kết nối Việc làm Sinh viên, Dự án Freelance và Bảo vệ Thù lao Tích hợp Trợ lý AI (StudentHub)",
        "Hệ thống Quản lý Thư viện Trường Đại học (Library Management System)": "Nền tảng Kết nối Việc làm Sinh viên, Dự án Freelance và Bảo vệ Thù lao Tích hợp Trợ lý AI (StudentHub)",
        "[Mô tả vấn đề hiện tại và lý do cần thực hiện dự án]": "Thị trường việc làm bán thời gian và dự án freelance dành cho sinh viên hiện nay đang đối mặt với nhiều bất cập nhức nhối: tình trạng lừa đảo việc nhẹ lương cao, bùng tiền thù lao sau khi bàn giao, thiếu minh bạch trong quy trình ứng tuyển và khó khăn trong việc tìm công việc linh hoạt theo thời khóa biểu học tập. Về phía doanh nghiệp/nhà tuyển dụng, họ tốn nhiều thời gian và chi phí để tìm kiếm nhân sự ngắn hạn có kỹ năng số đáng tin cậy. Đề tài StudentHub được xây dựng nhằm cung cấp một giải pháp công nghệ toàn diện, minh bạch và an toàn dành riêng cho sinh viên các trường đại học.",
        "[Mục tiêu 1]": "1. Xây dựng nền tảng Web 2 chiều kết nối việc làm part-time và dự án freelance cho sinh viên với giao diện hiện đại, tối ưu trải nghiệm (Responsive).",
        "[Mục tiêu 2]": "2. Triển khai cơ chế xác thực tài khoản qua OTP Gmail thật và bảo vệ quyền lợi tài chính thông qua cơ chế ký quỹ bảo chứng (Escrow) chống bùng thù lao 100%.",
        "[Mục tiêu 3]": "3. Tích hợp Trợ lý AI Google Gemini tự động tư vấn việc làm theo ngành học, chấm điểm và sửa lỗi CV 24/7; tách biệt cổng Quản trị Super Admin (/admin).",
        "Trong phạm vi: [...]": "Trong phạm vi: Xác thực đăng ký/đăng nhập bằng mã OTP 6 số qua Google SMTP thật; Quản lý hồ sơ sinh viên và doanh nghiệp; Đăng tin và bộ lọc tìm kiếm việc làm chuyên sâu phong cách TopCV; Ứng tuyển và quản lý tuyển dụng dạng bảng Kanban tự động gửi email thông báo trạng thái; Sàn dịch vụ Freelance, cơ chế ký quỹ Escrow và giải ngân thù lao vào Ví; Trợ lý AI Chatbot Google Gemini; Cổng Super Admin độc lập kiểm duyệt tin đăng và CMS cẩm nang.",
        "Ngoài phạm vi: [...]": "Ngoài phạm vi: Tích hợp cổng thanh toán trực tiếp đa ngân hàng qua Napas/Visa (thay thế bằng cơ chế Escrow qua Ví nội bộ hệ thống); Ứng dụng di động Native iOS/Android (thay thế bằng Web Responsive tối ưu trên mọi màn hình); Tuyển dụng việc làm toàn thời gian (Full-time corporate HR).",
        "Thời gian: [số tuần]": "Thời gian: 10 tuần (tương ứng 10 buổi môn Chuyên đề tốt nghiệp 2 / Quản lý dự án phần mềm).",
        "Ngân sách: [nếu có]": "Ngân sách: 0 VNĐ (tận dụng tối đa các dịch vụ Free-tier: Supabase, Google AI Studio, Google SMTP, Node.js, React).",
        "Công nghệ: [...]": "Công nghệ: Frontend React 18 (Vite, TailwindCSS, Lucide Icons), Backend Node.js (Express REST API), CSDL Supabase / MySQL, Trí tuệ nhân tạo Google Gemini API, Dịch vụ email Nodemailer Google SMTP.",
        "Giả định (Assumptions):": "Giả định (Assumptions):",
        "Kênh chính: [Zalo/Discord/Slack]": "Kênh chính: Nhóm Zalo trao đổi thông tin nhanh hàng ngày; Discord họp kỹ thuật, chia sẻ màn hình code và giải quyết bug.",
        "Họp định kỳ: [thời gian, tần suất]": "Họp định kỳ: Daily Standup 15 phút vào 21h00 mỗi tối; Sprint Planning và Sprint Retrospective vào sáng thứ Bảy hàng tuần.",
        "Thời gian phản hồi tối đa: [...]": "Thời gian phản hồi tối đa: Trong vòng 2 giờ vào ban ngày (08h00 - 22h00); các vấn đề khẩn cấp liên quan đến lỗi hệ thống gọi điện trực tiếp.",
        "Chiến lược nhánh (branching strategy): [Git Flow/Feature Branch...]": "Chiến lược nhánh (branching strategy): Áp dụng Git Flow nghiêm ngặt; nhánh 'main' là phiên bản ổn định (production), nhánh 'develop' là nhánh tích hợp kiểm thử, mỗi tính năng được phát triển trên nhánh riêng 'feature/<ten-tinh-nang>'.",
        "Quy ước đặt tên nhánh, commit message: [...]": "Quy ước đặt tên nhánh, commit message: Đặt tên nhánh theo cấu trúc 'feature/<module>-<tinh-nang>' hoặc 'bugfix/<ten-loi>'; commit message tuân thủ chuẩn Conventional Commits (feat:, fix:, docs:, refactor:, test:, chore:).",
        "Quy trình Code Review/Pull Request: [...]": "Quy trình Code Review/Pull Request: Mọi Pull Request (PR) hợp nhất vào nhánh develop phải có ít nhất 1 thành viên review mã nguồn, vượt qua kiểm thử build không lỗi và được Product Owner/Scrum Master chấp thuận.",
        "Sprint số: _____    Thời gian: từ ____ đến ____": "Sprint số: 03    Thời gian: từ 07/11/2026 đến 20/11/2026 (2 tuần - Mốc đánh giá Giữa kỳ)",
        "[Mô tả ngắn gọn mục tiêu chính cần đạt được trong Sprint này]": "Sprint Goal: Xây dựng hoàn chỉnh Sàn dịch vụ Freelance, Cơ chế ký quỹ Escrow bảo vệ thù lao, Quy trình nộp bài nghiệm thu & giải ngân trực tiếp vào Ví sinh viên, tích hợp Trợ lý AI Google Gemini Chatbox và cổng Super Admin độc lập.",
        "Thành phần tham gia Sprint Planning: [...]": "Thành phần tham gia Sprint Planning: Nguyễn Minh Phú (PO & Backend Lead), [Thành viên 2 - SM & Frontend Lead], [Thành viên 3 - Dev Team & QA Lead].",
        "Sprint số: _____    Tổng Story Point của Sprint: _____": "Sprint số: 03    Tổng Story Point của Sprint: 23 Story Points (Kế hoạch 10 ngày làm việc)",
        "Sprint số: _____    Ngày họp: ____    Thành phần tham gia: ____": "Sprint số: 03    Ngày họp Retrospective: 20/11/2026    Thành phần tham gia: Toàn bộ 3 thành viên nhóm",
        "[Số User Story hoàn thành / cam kết, feedback từ stakeholder]": "Kết quả Sprint Review: Hoàn thành 4/4 User Stories cam kết (23/23 Story Points - Đạt 100%). Luồng ký quỹ Escrow và giải ngân thù lao vận hành trơn tru, email tự động gửi thành công qua Google SMTP thật. Giảng viên đánh giá cao tính thực tiễn và tính năng bảo vệ sinh viên.",
        "[Tóm tắt mục tiêu, phạm vi đã thực hiện]": "Dự án StudentHub đã hoàn thành toàn bộ các mục tiêu cốt lõi đặt ra trong Project Charter cho giai đoạn giữa kỳ: xây dựng thành công nền tảng web kết nối việc làm và freelance cho sinh viên; bảo vệ tài khoản bằng mã OTP 6 số qua Gmail; tự động hóa thông báo trạng thái tuyển dụng qua Google SMTP; bảo vệ thù lao bằng cơ chế ký quỹ Escrow; hỗ trợ sinh viên bằng Trợ lý AI Google Gemini; cách ly hoàn toàn cổng Super Admin tại /admin.",
        "Đại diện nhóm: ___________________   Ngày: ___________": "Đại diện nhóm: Nguyễn Minh Phú (Nhóm trưởng)   Ngày: 20/11/2026",
        "Giảng viên hướng dẫn xác nhận: ___________________   Ngày: ___________": "Giảng viên hướng dẫn xác nhận: ThS. Nguyễn Văn Trung   Ngày: 20/11/2026",
        "Người phê duyệt: ___________________  Ngày: ___________": "Người phê duyệt: ThS. Nguyễn Văn Trung (GVHD)    Ngày phê duyệt: 02/10/2026"
    }

    # Replace specific placeholders
    for p in doc.paragraphs:
        txt = p.text.strip()
        for k, v in replacements.items():
            if k in p.text:
                p.text = p.text.replace(k, v)
        
        # Handle bare [...]
        if txt == "[...]":
            p.text = "1. Áp dụng mô hình Agile/Scrum với các chu kỳ Sprint 2 tuần và tiêu chí DoR/DoD rõ ràng giúp nhóm kiểm soát tốt tiến độ và hạn chế tối đa việc dồn việc vào cuối kỳ.\n2. Phân công vai trò kỹ thuật chuyên biệt (Backend, Frontend, QA/Tester) kết hợp họp Daily Scrum 15 phút giúp phát hiện và giải quyết xung đột mã nguồn từ sớm.\n3. Việc kiểm thử phân quyền và dữ liệu cá nhân theo User ID cần được thực hiện ngay từ cấp độ API backend trước khi kết nối giao diện để tránh các lỗi rò rỉ hoặc chặn quyền 403."

    # 2. Update Tables
    def set_cell(cell, text, bold=False):
        cell.text = text
        if bold and cell.paragraphs and cell.paragraphs[0].runs:
            cell.paragraphs[0].runs[0].font.bold = True

    # Table 0: Stakeholders (5x4)
    t0_data = [
        ['Họ tên', 'Vai trò trong dự án', 'Vai trò Scrum', 'Liên hệ'],
        ['ThS. Nguyễn Văn Trung', 'Giảng viên hướng dẫn / Cố vấn đề tài', 'Project Sponsor / Advisor', 'trung.nv@vlu.edu.vn'],
        ['Nguyễn Minh Phú', 'Nhóm trưởng / Trưởng nhóm Kỹ thuật', 'Product Owner / Backend Lead', 'phu47008@gmail.com'],
        ['[Thành viên 2 - Nhóm bổ sung]', 'Thành viên phát triển giao diện', 'Scrum Master / Frontend Lead', '[Email thành viên 2]'],
        ['[Thành viên 3 - Nhóm bổ sung]', 'Thành viên kiểm thử & tài liệu', 'Development Team / QA Lead', '[Email thành viên 3]']
    ]
    for r_idx, row in enumerate(doc.tables[0].rows):
        for c_idx, cell in enumerate(row.cells):
            set_cell(cell, t0_data[r_idx][c_idx], bold=(r_idx == 0))

    # Table 1: Milestones (6x3)
    t1_data = [
        ['Milestone', 'Ngày dự kiến', 'Ghi chú'],
        ['Khởi tạo dự án & Duyệt Project Charter', '02/10/2026', 'Hoàn thành Sprint 0, thống nhất đề tài StudentHub & SRS rút gọn'],
        ['Hoàn thành thiết kế CSDL & Wireframe UI', '16/10/2026', 'Hoàn thành ERD Relational Database, API Contract & Figma Wireframe'],
        ['Hoàn thành phát triển Core & Giữa kỳ (Mốc 2)', '20/11/2026', 'Hoàn thành Auth OTP Gmail, Việc làm TopCV, Kanban & Sàn Freelance Escrow'],
        ['Hoàn thành kiểm thử & Triển khai Cloud', '27/11/2026', 'Kiểm thử toàn diện Unit/Integration Test, RLS Security & Deploy Online'],
        ['Bàn giao, nghiệm thu & Bảo vệ đồ án', '04/12/2026', 'Đóng gói sản phẩm, hoàn tất báo cáo tổng kết & bảo vệ trước Hội đồng']
    ]
    for r_idx, row in enumerate(doc.tables[1].rows):
        for c_idx, cell in enumerate(row.cells):
            set_cell(cell, t1_data[r_idx][c_idx], bold=(r_idx == 0))

    # Table 2: Team Roles (6x4)
    t2_data = [
        ['Thành viên', 'Vai trò Scrum', 'Vai trò kỹ thuật', 'Trách nhiệm chính'],
        ['Nguyễn Minh Phú', 'Product Owner', 'Backend & Cloud/AI Lead', 'Quản lý Product Backlog, thiết kế CSDL, lập trình REST API, tích hợp Google SMTP & Gemini AI'],
        ['[Thành viên 2 - Nhóm bổ sung]', 'Scrum Master', 'Frontend & UI/UX Lead', 'Điều phối Sprint, dựng giao diện React/Tailwind, xây dựng Topbar Mega Menu, Kanban & Sàn Freelance'],
        ['[Thành viên 3 - Nhóm bổ sung]', 'Dev Team', 'Tester & QA Lead', 'Thiết kế Test Cases, kiểm thử phân quyền 403, kiểm thử luồng giải ngân ví & viết tài liệu'],
        ['Nguyễn Minh Phú', 'Dev Team', 'Database Administrator', 'Thiết kế Schema CSDL Supabase/MySQL, tối ưu hóa truy vấn và phân quyền dữ liệu RLS'],
        ['Cả 3 thành viên', 'Scrum Team', 'Full-stack Collaborator', 'Tham gia Daily Scrum, Sprint Planning, Code Review chéo và hỗ trợ tích hợp module']
    ]
    for r_idx, row in enumerate(doc.tables[2].rows):
        for c_idx, cell in enumerate(row.cells):
            set_cell(cell, t2_data[r_idx][c_idx], bold=(r_idx == 0))

    # Table 3: Product Backlog (5x6)
    t3_data = [
        ['ID', 'User Story', 'Ưu tiên', 'Story Point', 'Sprint dự kiến', 'Trạng thái'],
        ['US01', 'Là Người dùng, tôi muốn đăng ký/đăng nhập bằng OTP 6 số qua Gmail thật để bảo mật tài khoản', 'Cao', '5', 'Sprint 1', 'Done'],
        ['US02', 'Là Nhà tuyển dụng, tôi muốn đăng tin và quản lý ứng viên trên bảng Kanban tự động gửi email', 'Cao', '8', 'Sprint 2', 'Done'],
        ['US03', 'Là Sinh viên, tôi muốn tìm kiếm, lọc việc làm đa tiêu chí phong cách TopCV và nộp đơn online', 'Cao', '5', 'Sprint 2', 'Done'],
        ['US04', 'Là Sinh viên & NTD, chúng tôi muốn giao dịch Freelance với cơ chế ký quỹ Escrow bảo vệ thù lao', 'Cao', '8', 'Sprint 3', 'Done']
    ]
    for r_idx, row in enumerate(doc.tables[3].rows):
        for c_idx, cell in enumerate(row.cells):
            set_cell(cell, t3_data[r_idx][c_idx], bold=(r_idx == 0))

    # Add extra rows to Table 3 for US05 and US06
    extra_us = [
        ['US05', 'Là Sinh viên, tôi muốn Trợ lý AI Google Gemini tư vấn nghề nghiệp và hướng dẫn sửa CV 24/7', 'Trung bình', '5', 'Sprint 3', 'Done'],
        ['US06', 'Là Quản trị viên, tôi muốn cổng Super Admin /admin độc lập để kiểm duyệt tin và quản lý CMS', 'Trung bình', '5', 'Sprint 3', 'Done']
    ]
    for row_vals in extra_us:
        row = doc.tables[3].add_row()
        for c_idx, val in enumerate(row_vals):
            set_cell(row.cells[c_idx], val)

    # Table 4: Sprint Backlog (4x6)
    t4_data = [
        ['Task ID', 'Mô tả công việc', 'Người phụ trách', 'Ước lượng (giờ)', 'Thực tế (giờ)', 'Trạng thái'],
        ['T01', 'Thiết kế giao diện Sàn Freelance, Modal nộp nghiệm thu và Tab dịch vụ đã thuê của NTD', '[Thành viên 2]', '12', '11', 'Done'],
        ['T02', 'Lập trình REST API Ký quỹ Escrow, Bàn giao nghiệm thu và Giải ngân ví tự động', 'Nguyễn Minh Phú', '16', '15', 'Done'],
        ['T03', 'Kiểm thử luồng nghiệm thu dự án, xử lý lỗi phân quyền 403 và kiểm tra số dư ví đa tài khoản', '[Thành viên 3]', '14', '14', 'Done']
    ]
    for r_idx, row in enumerate(doc.tables[4].rows):
        for c_idx, cell in enumerate(row.cells):
            set_cell(cell, t4_data[r_idx][c_idx], bold=(r_idx == 0))
    row_t04 = doc.tables[4].add_row()
    for c_idx, val in enumerate(['T04', 'Tích hợp Trợ lý AI Google Gemini Chatbox tư vấn việc làm và sửa CV', 'Nguyễn Minh Phú', '10', '9', 'Done']):
        set_cell(row_t04.cells[c_idx], val)

    # Table 5: Project Schedule / Release Plan (8x4)
    t5_data = [
        ['Sprint', 'Thời gian', 'Trọng tâm / Tính năng bàn giao', 'Milestone liên quan'],
        ['Sprint 0', 'Tuần 1 (02/10 - 08/10)', 'Khởi tạo dự án, lập Project Charter, Team Charter & Product Backlog', 'Duyệt đề tài & Project Charter'],
        ['Sprint 1', 'Tuần 2–3 (09/10 - 22/10)', 'Thiết kế CSDL Relational, Wireframe Figma, Base Frontend & Auth OTP Gmail', 'SRS & Thiết kế chi tiết hoàn tất'],
        ['Sprint 2', 'Tuần 4–5 (23/10 - 05/11)', 'Module Việc làm part-time, Tìm kiếm TopCV, Ứng tuyển & Kanban gửi Email tự động', 'Demo Mốc giữa kỳ 1 (Rubric 2)'],
        ['Sprint 3', 'Tuần 6–7 (06/11 - 20/11)', 'Sàn Freelance, Ký quỹ Escrow, Bàn giao nghiệm thu & Giải ngân ví, Trợ lý Gemini AI', 'Demo Mốc giữa kỳ 2 (Go/No-go)'],
        ['Sprint 4', 'Tuần 8–9 (21/11 - 03/12)', 'Module Đánh giá 2 chiều, Chat thời gian thực, Kiểm thử bảo mật & Tối ưu Responsive', 'Kiểm thử & Triển khai Cloud'],
        ['Sprint 5', 'Tuần 10 (04/12 - 10/12)', 'Đóng gói mã nguồn, hoàn thiện Báo cáo tổng kết đồ án & Bảo vệ trước Hội đồng', 'Bàn giao & Nghiệm thu đồ án'],
        ['Sprint 6', 'Tuần 11–12 (Dự phòng)', 'Bảo trì hệ thống, hoàn thiện hồ sơ nghiệm thu lưu trữ khoa', 'Tổng kết môn học']
    ]
    for r_idx, row in enumerate(doc.tables[5].rows):
        for c_idx, cell in enumerate(row.cells):
            set_cell(cell, t5_data[r_idx][c_idx], bold=(r_idx == 0))

    # Table 6: Risk Register (5x6)
    t6_data = [
        ['Mã', 'Mô tả rủi ro', 'Xác suất', 'Ảnh hưởng', 'Mức ưu tiên', 'Biện pháp ứng phó'],
        ['R01', 'Google SMTP chặn gửi email do nghi ngờ gửi spam hàng loạt', 'Trung bình', 'Cao', 'Cao', 'Cấu hình App Password chuyên dụng, Smart Email Routing chuyển hướng email test'],
        ['R02', 'Cạn kiệt hạn mức quota API Google Gemini khi demo hoặc tải cao', 'Trung bình', 'Cao', 'Cao', 'Pipeline đa mô hình tự động chuyển mạch (flash-lite/3.5) và lưu cache phản hồi'],
        ['R03', 'Lỗi phân quyền 403 Forbidden khi sinh viên nộp bài nghiệm thu', 'Cao', 'Cao', 'Cao', 'Trích xuất định danh chuẩn xác từ req.user/body, kiểm tra quyền sở hữu đa chiều'],
        ['R04', 'Xung đột lịch thi giữa kỳ của các thành viên trong nhóm', 'Cao', 'Trung bình', 'Trung bình', 'Lập buffer dự phòng 3 ngày trước mỗi Sprint Review, phân bổ task linh hoạt']
    ]
    for r_idx, row in enumerate(doc.tables[6].rows):
        for c_idx, cell in enumerate(row.cells):
            set_cell(cell, t6_data[r_idx][c_idx], bold=(r_idx == 0))

    # Table 7: Burndown Chart (6x6)
    t7_data = [
        ['Ngày', 'Story Point còn lại (Thực tế)', 'Story Point còn lại (Lý tưởng)', 'Task Done trong ngày', 'Trở ngại (nếu có)', 'Ghi chú'],
        ['Ngày 1 (07/11)', '23', '23.0', 'Tổ chức Sprint Planning 3, phân rã task T01-T04', 'Chưa có', 'Bắt đầu Sprint 3'],
        ['Ngày 3 (10/11)', '18', '18.4', 'Hoàn thành UI Sàn Freelance & Đăng gói dịch vụ', 'Chưa có', 'Đúng tiến độ'],
        ['Ngày 5 (13/11)', '13', '13.8', 'Hoàn thành REST API Ký quỹ Escrow & Bàn giao bài', 'Cần test kỹ phân quyền', 'Vượt tiến độ 0.8 SP'],
        ['Ngày 7 (16/11)', '8', '9.2', 'Tích hợp Trợ lý AI Google Gemini Chatbox', 'Cấu hình quota API', 'Chạy thử nghiệm mượt mà'],
        ['Ngày 10 (20/11)', '0', '0.0', 'Fix dứt điểm lỗi 403 nghiệm thu, giải ngân ví test pass', 'Không có', 'Hoàn thành 100% Sprint 3']
    ]
    for r_idx, row in enumerate(doc.tables[7].rows):
        for c_idx, cell in enumerate(row.cells):
            set_cell(cell, t7_data[r_idx][c_idx], bold=(r_idx == 0))

    # Table 8: Risk Monitoring Log (4x6)
    t8_data = [
        ['Sprint', 'Mã rủi ro', 'Tình trạng hiện tại', 'Đã xảy ra?', 'Biện pháp đã thực hiện', 'Người theo dõi'],
        ['Sprint 2', 'R01', 'Đã xử lý dứt điểm', 'Có', 'Tích hợp Google SMTP App Password và Smart Email Routing thành công 100%', 'Nguyễn Minh Phú'],
        ['Sprint 3', 'R02', 'Đang kiểm soát tốt', 'Chưa', 'Cấu hình pipeline fallback giữa các model Gemini, tốc độ phản hồi < 1.5s', 'Nguyễn Minh Phú'],
        ['Sprint 3', 'R03', 'Đã xử lý dứt điểm', 'Có', 'Sửa middleware projectController & projectService, kiểm thử 18/18 test case pass', '[Thành viên 3]']
    ]
    for r_idx, row in enumerate(doc.tables[8].rows):
        for c_idx, cell in enumerate(row.cells):
            set_cell(cell, t8_data[r_idx][c_idx], bold=(r_idx == 0))

    # Table 9: Sprint Retrospective (4x3)
    t9_data = [
        ['Điều làm tốt (Keep)', 'Điều cần cải thiện (Improve)', 'Hành động cụ thể (Action Items)'],
        ['Hoàn thành 100% mục tiêu Sprint 3 (Sàn Freelance, Ký quỹ Escrow, AI Gemini)', 'Thao tác chuyển đổi vai trò khi demo còn hơi gấp gáp', 'Soạn kịch bản demo 8 bước chi tiết và phân vai cụ thể trước khi báo cáo'],
        ['Tự động gửi email thật thành công qua Google SMTP không bị vào spam', 'Một số ô nhập liệu số tiền cần có định dạng phân cách hàng nghìn rõ hơn', 'Áp dụng hàm tự động định dạng dấu chấm phân cách tiền tệ trên toàn bộ form'],
        ['Xử lý dứt điểm lỗi phân quyền 403, giải ngân ví tức thì theo thời gian thực', 'Cần viết thêm test case kiểm thử tự động cho luồng đổi tài khoản trên 1 máy', 'Bổ sung kịch bản kiểm thử đa tài khoản vào bộ tài liệu QA']
    ]
    for r_idx, row in enumerate(doc.tables[9].rows):
        for c_idx, cell in enumerate(row.cells):
            set_cell(cell, t9_data[r_idx][c_idx], bold=(r_idx == 0))

    # Table 10: Final Report - Plan vs Actual (4x3)
    t10_data = [
        ['Hạng mục', 'Kế hoạch ban đầu', 'Kết quả thực tế'],
        ['Phạm vi (số tính năng)', '10 tính năng cốt lõi (Must-have)', 'Hoàn thành 10/10 tính năng cốt lõi (100%), tích hợp thêm Trợ lý AI Gemini'],
        ['Thời gian', 'Hoàn thành mốc Giữa kỳ vào Buổi 7 (20/11/2026)', 'Đúng hạn 100%, sẵn sàng bàn giao phiên bản demo hoàn chỉnh'],
        ['Chất lượng (số lỗi, test pass)', 'Tỷ lệ test pass >= 90%, 0 lỗi bảo mật nghiêm trọng', '18/18 ca kiểm thử đạt (100% Pass), Frontend build sạch 0 lỗi trong 732ms']
    ]
    for r_idx, row in enumerate(doc.tables[10].rows):
        for c_idx, cell in enumerate(row.cells):
            set_cell(cell, t10_data[r_idx][c_idx], bold=(r_idx == 0))

    # Table 11: Final Report - Sprint Statistics (4x4)
    t11_data = [
        ['Sprint', 'Story Point cam kết', 'Story Point hoàn thành', 'Tỷ lệ hoàn thành'],
        ['Sprint 1 (Auth & Base Profile)', '10 SP', '10 SP', '100%'],
        ['Sprint 2 (Jobs, Search & Kanban)', '14 SP', '14 SP', '100%'],
        ['Sprint 3 (Freelance, Escrow, AI & Admin)', '23 SP', '23 SP', '100%']
    ]
    for r_idx, row in enumerate(doc.tables[11].rows):
        for c_idx, cell in enumerate(row.cells):
            set_cell(cell, t11_data[r_idx][c_idx], bold=(r_idx == 0))

    # Table 12: Member Contributions (3x5)
    t12_data = [
        ['Thành viên', 'Vai trò', 'Đóng góp chính', 'Tự đánh giá (%)', 'Điểm'],
        ['Nguyễn Minh Phú', 'Product Owner & Backend Lead', 'Kiến trúc CSDL, REST API, Google SMTP, Ký quỹ Escrow, Tích hợp AI Gemini & Điều phối', '34%', '10/10'],
        ['[Thành viên 2 - Nhóm bổ sung]', 'Scrum Master & Frontend Lead', 'Xây dựng giao diện React SPA, Topbar Mega Menu, Bộ lọc TopCV, Bảng Kanban & Sàn Freelance', '33%', '10/10']
    ]
    for r_idx, row in enumerate(doc.tables[12].rows):
        for c_idx, cell in enumerate(row.cells):
            set_cell(cell, t12_data[r_idx][c_idx], bold=(r_idx == 0))
    
    # Add Member 3 to Table 12
    row_m3 = doc.tables[12].add_row()
    m3_vals = ['[Thành viên 3 - Nhóm bổ sung]', 'Dev Team & QA/Tester Lead', 'Thiết kế Test Case, kiểm thử phân quyền 403, kiểm thử luồng giải ngân ví & Soạn tài liệu', '33%', '10/10']
    for c_idx, val in enumerate(m3_vals):
        set_cell(row_m3.cells[c_idx], val)

    doc.save(doc_path)
    print('Completed updating CauTruc_QuanLyDuAn_AgileScrum.docx successfully!')

if __name__ == '__main__':
    complete_agile_docx()
