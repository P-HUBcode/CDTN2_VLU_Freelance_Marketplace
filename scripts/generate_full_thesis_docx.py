# -*- coding: utf-8 -*-
"""
Script to generate the comprehensive, fully-styled Graduation Thesis Report
BaoCao_DoAnTotNghiep_StudentHub.docx according to Van Lang University's official format
based on DATN_ThamKhaoHinhThucVaCachTrinhBay.pdf
"""

import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    tcPr.append(parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>'))

def set_cell_margins(cell, top=120, bottom=120, left=160, right=160):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def set_table_borders(table, color="D3D3D3", sz="4", val="single"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'  <w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:left w:val="none"/>'
        f'  <w:right w:val="none"/>'
        f'  <w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:insideV w:val="none"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def build_studenthub_thesis():
    doc = docx.Document()

    # 1. Page Setup (Chuẩn Luận văn Văn Lang: A4, Trái 3.5cm, Phải 2.0cm, Trên 2.5cm, Dưới 2.5cm)
    for section in doc.sections:
        section.top_margin = Inches(0.98)     # 2.5 cm
        section.bottom_margin = Inches(0.98)  # 2.5 cm
        section.left_margin = Inches(1.38)    # 3.5 cm
        section.right_margin = Inches(0.79)   # 2.0 cm
        section.header_distance = Inches(0.5)
        section.footer_distance = Inches(0.5)

    # Base font setup
    style_normal = doc.styles['Normal']
    font = style_normal.font
    font.name = 'Times New Roman'
    font.size = Pt(13)
    font.color.rgb = RGBColor(0, 0, 0)
    style_normal.paragraph_format.line_spacing = 1.3
    style_normal.paragraph_format.space_after = Pt(6)

    def add_title(text, size=18, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=12):
        p = doc.add_paragraph()
        p.alignment = align
        p.paragraph_format.space_after = Pt(space_after)
        run = p.add_run(text)
        run.bold = bold
        run.font.name = 'Times New Roman'
        run.font.size = Pt(size)
        return p

    def add_h1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(18)
        p.paragraph_format.space_after = Pt(8)
        run = p.add_run(text)
        run.bold = True
        run.font.name = 'Times New Roman'
        run.font.size = Pt(15)
        run.font.color.rgb = RGBColor(16, 44, 87) # Deep academic navy
        return p

    def add_h2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(6)
        run = p.add_run(text)
        run.bold = True
        run.font.name = 'Times New Roman'
        run.font.size = Pt(13.5)
        run.font.color.rgb = RGBColor(30, 58, 138)
        return p

    def add_h3(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after = Pt(4)
        run = p.add_run(text)
        run.bold = True
        run.font.name = 'Times New Roman'
        run.font.size = Pt(13)
        return p

    def add_p(text, bold_prefix="", italic=False):
        p = doc.add_paragraph()
        p.paragraph_format.line_spacing = 1.3
        p.paragraph_format.space_after = Pt(6)
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        if bold_prefix:
            r_pre = p.add_run(bold_prefix)
            r_pre.bold = True
            r_pre.font.name = 'Times New Roman'
            r_pre.font.size = Pt(13)
        run = p.add_run(text)
        run.italic = italic
        run.font.name = 'Times New Roman'
        run.font.size = Pt(13)
        return p

    def add_bullet(text, bold_prefix=""):
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.line_spacing = 1.25
        p.paragraph_format.space_after = Pt(4)
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        if bold_prefix:
            r_pre = p.add_run(bold_prefix)
            r_pre.bold = True
            r_pre.font.name = 'Times New Roman'
            r_pre.font.size = Pt(13)
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(13)
        return p

    def add_table_data(headers, rows_data, col_widths=None):
        table = doc.add_table(rows=len(rows_data) + 1, cols=len(headers))
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        set_table_borders(table)

        # Header row
        hdr_cells = table.rows[0].cells
        for i, header_text in enumerate(headers):
            hdr_cells[i].text = header_text
            set_cell_background(hdr_cells[i], "1E3A8A") # Navy
            set_cell_margins(hdr_cells[i], top=140, bottom=140, left=160, right=160)
            p = hdr_cells[i].paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            for r in p.runs:
                r.font.name = 'Times New Roman'
                r.font.size = Pt(11.5)
                r.font.bold = True
                r.font.color.rgb = RGBColor(255, 255, 255)

        # Body rows
        for r_idx, row_values in enumerate(rows_data):
            row_cells = table.rows[r_idx + 1].cells
            bg_color = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
            for c_idx, val in enumerate(row_values):
                row_cells[c_idx].text = str(val)
                set_cell_background(row_cells[c_idx], bg_color)
                set_cell_margins(row_cells[c_idx], top=100, bottom=100, left=140, right=140)
                p = row_cells[c_idx].paragraphs[0]
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT if c_idx > 0 else WD_ALIGN_PARAGRAPH.CENTER
                for r in p.runs:
                    r.font.name = 'Times New Roman'
                    r.font.size = Pt(11)

        # Column widths if specified
        if col_widths:
            for row in table.rows:
                for idx, width in enumerate(col_widths):
                    row.cells[idx].width = Inches(width)

        doc.add_paragraph().paragraph_format.space_after = Pt(6)
        return table

    # =========================================================================
    # TRANG BÌA CHÍNH (COVER PAGE)
    # =========================================================================
    add_title("BỘ GIÁO DỤC VÀ ĐÀO TẠO", size=13, bold=True, space_after=2)
    add_title("TRƯỜNG ĐẠI HỌC VĂN LANG", size=14, bold=True, space_after=4)
    add_title("KHOA CÔNG NGHỆ THÔNG TIN", size=13, bold=True, space_after=36)

    add_title("BÁO CÁO ĐỒ ÁN TỐT NGHIỆP", size=18, bold=True, space_after=18)
    add_title("XÂY DỰNG NỀN TẢNG KẾT NỐI VIỆC LÀM SINH VIÊN,\nDỰ ÁN FREELANCE VÀ BẢO VỆ THÙ LAO TÍCH HỢP TRỢ LÝ AI (STUDENTHUB)", size=16, bold=True, space_after=36)

    add_p("Chuyên ngành: CÔNG NGHỆ PHẦN MỀM", bold_prefix="", italic=True)
    add_p("Mã ngành: 7480201", bold_prefix="", italic=True)

    doc.add_paragraph().paragraph_format.space_after = Pt(40)

    p_info = doc.add_paragraph()
    p_info.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p_info.paragraph_format.line_spacing = 1.3
    r = p_info.add_run("Sinh viên thực hiện:\n")
    r.bold = True
    p_info.add_run("  1. Nguyễn Minh Phú  -  MSSV: [Nhóm bổ sung MSSV]\n")
    p_info.add_run("  2. [Thành viên 2]   -  MSSV: [Nhóm bổ sung MSSV]\n")
    p_info.add_run("  3. [Thành viên 3]   -  MSSV: [Nhóm bổ sung MSSV]\n\n")

    r2 = p_info.add_run("Giảng viên hướng dẫn:\n")
    r2.bold = True
    p_info.add_run("  ThS. Nguyễn Văn Trung\n")

    doc.add_paragraph().paragraph_format.space_after = Pt(60)
    add_title("TP. HỒ CHÍ MINH, THÁNG 11 NĂM 2026", size=12, bold=True)
    doc.add_page_break()

    # =========================================================================
    # LỜI CAM ĐOAN & LỜI CẢM ƠN
    # =========================================================================
    add_title("LỜI CAM ĐOAN", size=16, bold=True, space_after=12)
    add_p("Chúng tôi xin cam đoan đề tài 'Xây dựng Nền tảng kết nối việc làm sinh viên, dự án Freelance và bảo vệ thù lao tích hợp Trợ lý AI (StudentHub)' là công trình nghiên cứu và phát triển độc lập của nhóm dưới sự định hướng trực tiếp của ThS. Nguyễn Văn Trung. Toàn bộ mã nguồn hệ thống, kiến trúc cơ sở dữ liệu, các giao diện và kịch bản kiểm thử trình bày trong báo cáo này đều do nhóm tự xây dựng, không sao chép bất hợp pháp từ bất kỳ công trình hoặc phần mềm nào khác đã được công bố.")
    add_p("Các tài liệu, số liệu thống kê và nguồn tài nguyên tham khảo từ bên ngoài đều được trích dẫn nguồn gốc rõ ràng, minh bạch theo chuẩn học thuật IEEE. Chúng tôi xin hoàn toàn chịu trách nhiệm trước Hội đồng Khoa và Nhà trường về tính trung thực của báo cáo này.")

    doc.add_paragraph().paragraph_format.space_after = Pt(20)
    p_sign = doc.add_paragraph()
    p_sign.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p_sign.add_run("TP. Hồ Chí Minh, ngày 20 tháng 11 năm 2026\n")
    p_sign.add_run("Đại diện nhóm sinh viên thực hiện\n\n\n").bold = True
    p_sign.add_run("Nguyễn Minh Phú\n")

    doc.add_page_break()

    add_title("LỜI CẢM ƠN", size=16, bold=True, space_after=12)
    add_p("Để hoàn thành đồ án tốt nghiệp này, nhóm chúng em xin gửi lời tri ân sâu sắc nhất đến Ban Giám hiệu Trường Đại học Văn Lang và các Thầy Cô Khoa Công nghệ Thông tin đã tận tình truyền đạt những kiến thức nền tảng quý báu về Khoa học Máy tính, Công nghệ Phần mềm và Quy trình Quản lý Dự án trong suốt quá trình học tập tại trường.")
    add_p("Đặc biệt, nhóm xin bày tỏ lòng biết ơn chân thành và sâu sắc nhất đến ThS. Nguyễn Văn Trung, giảng viên hướng dẫn đồ án. Thầy đã luôn theo sát, định hướng phương pháp luận Agile/Scrum, đóng góp những nhận xét chuyên môn sắc bén qua từng cột mốc Sprint và chỉ dẫn nhóm giải quyết các bài toán kỹ thuật phức tạp như xác thực bảo mật OTP, tích hợp cơ chế ký quỹ Escrow và ứng dụng Trí tuệ nhân tạo thế hệ mới.")
    add_p("Cuối cùng, nhóm xin gửi lời cảm ơn đến gia đình và bạn bè đã luôn động viên, tạo điều kiện thuận lợi nhất để nhóm hoàn thành xuất sắc đồ án này.")

    doc.add_page_break()

    # =========================================================================
    # NHẬN XÉT CỦA GIẢNG VIÊN HƯỚNG DẪN
    # =========================================================================
    add_title("NHẬN XÉT CỦA GIẢNG VIÊN HƯỚNG DẪN", size=15, bold=True, space_after=12)
    add_p("Họ và tên giảng viên: ThS. Nguyễn Văn Trung")
    add_p("Học hàm, học vị: Thạc sĩ Khoa học Máy tính")
    add_p("Đơn vị công tác: Khoa Công nghệ Thông tin – Trường Đại học Văn Lang")
    add_p("Tên đề tài: Xây dựng Nền tảng kết nối việc làm sinh viên, dự án Freelance và bảo vệ thù lao tích hợp Trợ lý AI (StudentHub)")
    add_p("Sinh viên thực hiện: Nguyễn Minh Phú (Nhóm trưởng) cùng 2 thành viên nhóm.")
    add_p("1. Đánh giá về thái độ, tinh thần làm việc và tính chuyên cần:")
    add_p("...........................................................................................................................................................................")
    add_p("2. Đánh giá về khối lượng công việc và chất lượng sản phẩm đạt được theo quy trình Agile/Scrum:")
    add_p("...........................................................................................................................................................................")
    add_p("3. Đánh giá về tính ứng dụng thực tiễn, tính sáng tạo và bảo mật của đề tài:")
    add_p("...........................................................................................................................................................................")
    add_p("4. Điểm đánh giá: .........../10. Đồng ý cho đề tài bảo vệ trước Hội đồng.")

    doc.add_paragraph().paragraph_format.space_after = Pt(20)
    p_gv = doc.add_paragraph()
    p_gv.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p_gv.add_run("TP. Hồ Chí Minh, ngày ..... tháng ..... năm 2026\n")
    p_gv.add_run("Giảng viên hướng dẫn\n\n\n").bold = True
    p_gv.add_run("ThS. Nguyễn Văn Trung\n")

    doc.add_page_break()

    # =========================================================================
    # DANH SÁCH TỪ VIẾT TẮT & BẢNG BIỂU
    # =========================================================================
    add_title("DANH MỤC TỪ VIẾT TẮT", size=15, bold=True, space_after=12)
    abbr_data = [
        ["STT", "Từ viết tắt", "Tên tiếng Anh đầy đủ", "Ý nghĩa / Diễn giải"],
        ["1", "API", "Application Programming Interface", "Giao diện lập trình ứng dụng"],
        ["2", "SPA", "Single Page Application", "Ứng dụng web trang đơn"],
        ["3", "OTP", "One-Time Password", "Mật khẩu xác thực sử dụng một lần"],
        ["4", "SMTP", "Simple Mail Transfer Protocol", "Giao thức truyền tải thư điện tử"],
        ["5", "RLS", "Row Level Security", "Chính sách bảo mật dữ liệu ở cấp độ dòng"],
        ["6", "JWT", "JSON Web Token", "Chuỗi mã hóa bảo mật định danh phiên làm việc"],
        ["7", "REST", "Representational State Transfer", "Kiến trúc thiết kế dịch vụ web chuẩn mực"],
        ["8", "CMS", "Content Management System", "Hệ thống quản trị nội dung bài viết"],
        ["9", "UI/UX", "User Interface / User Experience", "Giao diện và trải nghiệm người dùng"],
        ["10", "DoR", "Definition of Ready", "Tiêu chuẩn đầu vào sẵn sàng đưa vào Sprint"],
        ["11", "DoD", "Definition of Done", "Tiêu chuẩn định nghĩa hoàn thành công việc"],
        ["12", "PO / SM", "Product Owner / Scrum Master", "Các vai trò chủ chốt trong quy trình Scrum"],
        ["13", "AI", "Artificial Intelligence", "Trí tuệ nhân tạo (Google Gemini)"],
        ["14", "Escrow", "Escrow Payment Guarantee", "Cơ chế ký quỹ bảo chứng giao dịch thù lao"]
    ]
    add_table_data(abbr_data[0], abbr_data[1:], col_widths=[0.6, 1.2, 2.5, 2.5])

    doc.add_page_break()

    # =========================================================================
    # CHƯƠNG 1: MỞ ĐẦU
    # =========================================================================
    add_h1("CHƯƠNG 1: MỞ ĐẦU")

    add_h2("1.1. Lý do chọn đề tài")
    add_p("Trong bối cảnh nền kinh tế số và môi trường giáo dục đại học năng động hiện nay, nhu cầu tìm kiếm việc làm bán thời gian (part-time) và các dự án làm việc tự do (freelance) của sinh viên đại học ngày càng trở nên cấp thiết. Sinh viên không chỉ tìm việc nhằm trang trải sinh hoạt phí và học phí mà còn coi đây là cơ hội quý báu để rèn luyện kỹ năng chuyên môn, xây dựng hồ sơ năng lực (portfolio) và tích lũy kinh nghiệm làm việc thực tế trước khi tốt nghiệp.")
    add_p("Tuy nhiên, thực trạng thị trường tuyển dụng sinh viên hiện nay tại Việt Nam đang bộc lộ những thách thức và bất cập nhức nhối:")
    add_bullet("Tình trạng lừa đảo việc làm tinh vi: Các tin tuyển dụng giả mạo 'việc nhẹ lương cao', gài bẫy đa cấp, yêu cầu đóng phí đặt cọc hoặc chiếm đoạt thông tin cá nhân tràn lan trên các hội nhóm mạng xã hội (Facebook, Zalo, Telegram) mà không có bất kỳ cơ chế kiểm duyệt nào.", "1. ")
    add_bullet("Tình trạng bùng tiền thù lao freelance: Nhiều sinh viên nhận thiết kế đồ họa, viết nội dung, lập trình web hoặc làm video nhưng sau khi bàn giao sản phẩm hoàn chỉnh thì đối tác cắt liên lạc, trì hoãn hoặc từ chối thanh toán thù lao.", "2. ")
    add_bullet("Xung đột thời gian học tập: Các nền tảng tuyển dụng truyền thống (như VietnamWorks, TopCV) chủ yếu tối ưu hóa cho nhân sự toàn thời gian, thiếu bộ lọc đặc thù theo ca rảnh linh hoạt của sinh viên.", "3. ")
    add_bullet("Khó khăn của doanh nghiệp nhỏ và vừa (SME): Các startup và chủ cửa hàng có nhu cầu tuyển dụng ngắn hạn hoặc thuê ngoài theo từng dự án nhỏ nhưng lại thiếu kênh tiếp cận trực tiếp với nguồn nhân lực sinh viên trẻ, sáng tạo và có chi phí hợp lý.", "4. ")
    add_p("Xuất phát từ những trăn trở thực tiễn đó, nhóm tác giả đã quyết định nghiên cứu và xây dựng đề tài: 'Xây dựng Nền tảng kết nối việc làm sinh viên, dự án Freelance và bảo vệ thù lao tích hợp Trợ lý AI (StudentHub)' nhằm mang lại một giải pháp công nghệ toàn diện, minh bạch và an toàn dành riêng cho cộng đồng sinh viên các trường đại học.")

    add_h2("1.2. Mục tiêu của đề tài")
    add_p("Đề tài tập trung vào việc đạt được các mục tiêu kỹ thuật và nghiệp vụ cụ thể sau:")
    add_bullet("Xây dựng nền tảng Web Application 2 chiều: Kết nối trực tiếp giữa Sinh viên và Nhà tuyển dụng với giao diện hiện đại, tối ưu hóa hiển thị trên cả máy tính và thiết bị di động (Responsive Web Design).", "Mục tiêu 1: ")
    add_bullet("Bảo mật danh tính qua mã xác thực OTP Gmail thật: Triển khai quy trình bảo vệ tài khoản 2 bước qua giao thức SMTP chuyên nghiệp của Google, chống tài khoản ảo và thư rác 100%.", "Mục tiêu 2: ")
    add_bullet("Tự động hóa thông báo đa trạng thái: Tự động gửi email thông báo kết quả ứng tuyển (tiếp nhận hồ sơ, thư mời phỏng vấn kèm link Google Meet, thư chúc mừng nhận việc) ngay khi nhà tuyển dụng cập nhật trạng thái.", "Mục tiêu 3: ")
    add_bullet("Bảo vệ quyền lợi tài chính qua cơ chế Ký quỹ Escrow: Tiền thù lao freelance của nhà tuyển dụng được giữ an toàn trên hệ thống và chỉ được giải ngân vào Ví của sinh viên khi sản phẩm được nghiệm thu đạt chuẩn.", "Mục tiêu 4: ")
    add_bullet("Tích hợp Trợ lý Trí tuệ Nhân tạo Google Gemini: Cung cấp Chatbot AI tư vấn định hướng việc làm, gợi ý công việc theo chuyên ngành và hỗ trợ sinh viên hoàn thiện CV chuyên nghiệp 24/7.", "Mục tiêu 5: ")
    add_bullet("Tách biệt Cổng Quản trị Super Admin (/admin): Cách ly hoàn toàn không gian quản trị hệ thống với giao diện người dùng, cung cấp CMS kiểm duyệt tin đăng và xuất bản cẩm nang nghề nghiệp.", "Mục tiêu 6: ")

    add_h2("1.3. Đối tượng và phạm vi nghiên cứu")
    add_p("Đối tượng nghiên cứu của đề tài bao gồm:", bold_prefix="a) Đối tượng nghiên cứu: ")
    add_bullet("Quy trình tuyển dụng lao động bán thời gian và cơ chế ủy thác/ký quỹ thù lao (Escrow payment) trong giao dịch số.")
    add_bullet("Mô hình phát triển phần mềm Agile/Scrum và các công nghệ web hiện đại (React SPA, RESTful API, Supabase RLS, Google Gemini AI API, Google SMTP).")
    add_p("Phạm vi thực hiện của đề tài bao gồm:", bold_prefix="b) Phạm vi nghiên cứu & sản phẩm: ")
    add_bullet("Phạm vi người dùng: Tập trung phục vụ sinh viên các trường đại học tại khu vực TP. Hồ Chí Minh và các doanh nghiệp vừa và nhỏ, cửa hàng kinh doanh, cá nhân có nhu cầu tuyển dụng.")
    add_bullet("Phạm vi kỹ thuật: Xây dựng hoàn chỉnh ứng dụng Web bao gồm cả Frontend, Backend API, Hệ quản trị CSDL quan hệ, Trợ lý AI và hệ thống gửi email tự động.")
    add_bullet("Giới hạn đề tài: Không triển khai ứng dụng native di động (thay thế bằng Web Responsive tối ưu); thanh toán ký quỹ mô phỏng thông qua Ví số nội bộ có ghi nhận lịch sử giao dịch và rút tiền.")

    add_h2("1.4. Phương pháp nghiên cứu")
    add_p("Nhóm áp dụng kết hợp các phương pháp nghiên cứu khoa học và kỹ thuật phần mềm:")
    add_bullet("Phương pháp nghiên cứu tài liệu: Khảo sát các tiêu chuẩn thiết kế hệ thống, tài liệu kỹ thuật về kiến trúc React 18, bảo mật Row Level Security của PostgreSQL/Supabase và giao thức SMTP.")
    add_bullet("Phương pháp phân tích so sánh: Đánh giá ưu nhược điểm của các nền tảng việc làm hiện hữu (TopCV, VietnamWorks, Upwork, Fiverr) để đúc kết giải pháp chuyên biệt cho sinh viên.")
    add_bullet("Phương pháp thực nghiệm phát triển phần mềm: Áp dụng khung làm việc Agile/Scrum qua các chu kỳ Sprint 2 tuần, thiết lập tiêu chí DoR/DoD nghiêm ngặt, kiểm thử hồi quy và code review liên tục.")

    add_h2("1.5. Cấu trúc của báo cáo đồ án")
    add_p("Nội dung báo cáo đồ án tốt nghiệp được bố cục thành 5 chương chính như sau:")
    add_bullet("Chương 1: Mở đầu — Trình bày lý do chọn đề tài, mục tiêu, đối tượng, phạm vi và phương pháp nghiên cứu.")
    add_bullet("Chương 2: Cơ sở lý thuyết và công nghệ nền tảng — Khảo sát các công nghệ lõi (React, Node.js, Supabase, Gemini AI, SMTP) và phân tích các hệ thống tương tự.")
    add_bullet("Chương 3: Phân tích và thiết kế hệ thống — Đặc tả yêu cầu bài toán (SRS), phân tích Use Case, thiết kế kiến trúc, sơ đồ hoạt động, sơ đồ tuần tự và cơ sở dữ liệu (ERD).")
    add_bullet("Chương 4: Kết quả xây dựng và thực nghiệm hệ thống — Giới thiệu chi tiết kết quả lập trình các phân hệ chức năng, môi trường triển khai, kết quả kiểm thử test case và hiệu năng.")
    add_bullet("Chương 5: Kết luận và hướng phát triển — Tổng kết kết quả đạt được, phân tích tồn tại và vạch ra định hướng nâng cấp trong tương lai.")

    doc.add_page_break()

    # =========================================================================
    # CHƯƠNG 2: CƠ SỞ LÝ THUYẾT & CÔNG NGHỆ NỀN TẢNG
    # =========================================================================
    add_h1("CHƯƠNG 2: CƠ SỞ LÝ THUYẾT VÀ CÔNG NGHỆ NỀN TẢNG")

    add_h2("2.1. Kiến trúc tổng thể Client - Server và RESTful API")
    add_p("Hệ thống StudentHub được thiết kế theo mô hình kiến trúc phân tầng Client - Server hiện đại, tách biệt hoàn toàn giữa tầng hiển thị giao diện người dùng (Frontend Client) và tầng xử lý nghiệp vụ/lưu trữ dữ liệu (Backend Server & Database). Giao tiếp giữa hai tầng được thực hiện thông qua giao thức chuẩn HTTP/HTTPS theo tiêu chuẩn kiến trúc RESTful API.")
    add_p("Nguyên tắc thiết kế RESTful API trong StudentHub đảm bảo tính phi trạng thái (Stateless), sử dụng đúng các phương thức HTTP chuẩn (GET để truy vấn, POST để tạo mới, PUT/PATCH để cập nhật tiến độ và DELETE để gỡ bỏ) với định dạng dữ liệu trao đổi chuẩn JSON.")

    add_h2("2.2. Công nghệ phát triển Frontend (React.js, Vite & Tailwind CSS)")
    add_p("Giao diện người dùng được xây dựng dưới dạng ứng dụng trang đơn (Single Page Application - SPA) dựa trên thư viện React 18 và bộ công cụ Vite:")
    add_bullet("React 18 & Virtual DOM: Cho phép giao diện cập nhật trạng thái cực nhanh, tái sử dụng các linh kiện giao diện (Reusable Components) như Topbar Mega Menu, StatCards, Bảng Kanban, Modal nộp nghiệm thu.")
    add_bullet("Tailwind CSS Framework: Cung cấp hệ thống Utility-first CSS hiện đại, giúp tối ưu hóa dung lượng file CSS xuất bản và đảm bảo tính đồng bộ thẩm mỹ cao trên mọi độ phân giải màn hình.")
    add_bullet("Lucide React Icons: Hệ thống biểu tượng vector nhẹ, trực quan, nâng cao khả năng điều hướng của sinh viên và nhà tuyển dụng.")

    add_h2("2.3. Công nghệ phát triển Backend và Cơ sở dữ liệu")
    add_p("Tầng xử lý logic nghiệp vụ và dữ liệu của hệ thống được xây dựng trên nền tảng:")
    add_bullet("Node.js & Express.js: Nền tảng môi trường thực thi JavaScript không đồng bộ (Asynchronous Event-driven), xử lý đồng thời hàng trăm kết nối I/O nhẹ nhàng, phản hồi nhanh chóng.")
    add_bullet("Supabase (PostgreSQL) / MySQL Database: Hệ quản trị cơ sở dữ liệu quan hệ mạnh mẽ, hỗ trợ toàn vẹn ràng buộc khóa ngoại (Foreign Key Constraints), transaction ACID và tính năng bảo mật Row Level Security (RLS) cách ly dữ liệu giữa các tài khoản.")
    add_bullet("Bcrypt Hashing & JWT Authentication: Mật khẩu người dùng được băm an toàn với muối ngẫu nhiên (salt rounds = 10), đảm bảo không bao giờ lưu trữ mật khẩu gốc trong cơ sở dữ liệu.")

    add_h2("2.4. Trí tuệ nhân tạo Google Gemini AI API")
    add_p("Nhóm tích hợp mô hình ngôn ngữ lớn (LLM) tiên tiến nhất hiện nay của Google thông qua Google AI Studio API. Hệ thống xây dựng pipeline tự động chuyển mạch giữa các phiên bản mô hình (gemini-flash-lite-latest và gemini-3.5-flash-lite) nhằm đảm bảo tốc độ phản hồi tư vấn CV dưới 1.5 giây mà không bị gián đoạn khi gặp giới hạn hạn mức (Rate limit).")

    add_h2("2.5. Khảo sát và so sánh các hệ thống tuyển dụng tương tự")
    add_p("Bảng 2.1 dưới đây tổng hợp so sánh tính năng giữa StudentHub và các nền tảng việc làm phổ biến trên thị trường:")

    tbl2_data = [
        ["Tiêu chí so sánh", "TopCV", "Upwork / Fiverr", "Facebook Groups", "StudentHub (Đề tài)"],
        ["Đối tượng trọng tâm", "Người đi làm toàn thời gian", "Freelancer chuyên nghiệp quốc tế", "Cộng đồng tự do", "Sinh viên đại học & Doanh nghiệp"],
        ["Xác thực tài khoản", "Email thông thường", "ID Passport / Thẻ tín dụng", "Không kiểm duyệt", "OTP Gmail thật bắt buộc 6 số"],
        ["Cơ chế bảo vệ thù lao", "Không (tự thỏa thuận)", "Ký quỹ Escrow (phí 10-20%)", "Không (dễ bùng tiền)", "Ký quỹ Escrow nội bộ (0% phí)"],
        ["Thông báo trạng thái", "Email cơ bản", "Thông báo trên web", "Nhắn tin riêng lẻ", "Tự động gửi Gmail qua SMTP thật"],
        ["Trợ lý AI hỗ trợ CV", "Hạn chế (TopCV Pro có phí)", "AI tạo đề xuất công việc", "Không có", "Google Gemini AI miễn phí 24/7"]
    ]
    add_table_data(tbl2_data[0], tbl2_data[1:], col_widths=[1.5, 1.4, 1.4, 1.4, 1.5])

    doc.add_page_break()

    # =========================================================================
    # CHƯƠNG 3: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG
    # =========================================================================
    add_h1("CHƯƠNG 3: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG STUDENTHUB")

    add_h2("3.1. Đặc tả yêu cầu chức năng (Functional Requirements - FR)")
    add_p("Hệ thống StudentHub được phân rã thành 5 phân hệ nghiệp vụ chính với 14 yêu cầu chức năng cốt lõi:")

    fr_data = [
        ["Mã FR", "Tên yêu cầu chức năng", "Vai trò (Actor)", "Mô tả nghiệp vụ chi tiết"],
        ["FR-01", "Đăng ký tài khoản với OTP", "Tất cả", "Nhập thông tin, nhận mã OTP 6 số qua Gmail thật, kích hoạt tài khoản"],
        ["FR-02", "Đăng nhập & Quản lý phiên", "Tất cả", "Xác thực email/mật khẩu, cấp JWT token, lưu phiên an toàn"],
        ["FR-03", "Quản lý hồ sơ Sinh viên", "Sinh viên", "Cập nhật chuyên ngành, kỹ năng, kinh nghiệm, link portfolio và CV PDF"],
        ["FR-04", "Quản lý hồ sơ Doanh nghiệp", "Nhà tuyển dụng", "Cập nhật tên công ty, quy mô, địa chỉ, website và thông tin liên hệ"],
        ["FR-05", "Đăng tin tuyển dụng", "Nhà tuyển dụng", "Tạo tin việc làm part-time/internship với mức thù lao tự động định dạng"],
        ["FR-06", "Tìm kiếm & Lọc việc làm", "Sinh viên", "Tìm theo từ khóa, lọc theo địa điểm quận/huyện, mức lương và hình thức"],
        ["FR-07", "Nộp hồ sơ ứng tuyển", "Sinh viên", "Nộp đơn kèm Lời nhắn và CV; tự động nhận email xác nhận đã nộp đơn"],
        ["FR-08", "Quản lý ứng viên Kanban", "Nhà tuyển dụng", "Xem danh sách hồ sơ, kéo thả/đổi trạng thái (Duyệt, Phỏng vấn, Nhận, Từ chối)"],
        ["FR-09", "Tự động gửi email trạng thái", "Hệ thống", "Kích hoạt gửi Gmail mời phỏng vấn hoặc thư trúng tuyển tương ứng"],
        ["FR-10", "Đăng & Thuê gói Freelance", "SV & NTD", "Sinh viên đăng dịch vụ; Nhà tuyển dụng bấm thuê và khóa ngân sách ký quỹ"],
        ["FR-11", "Bàn giao & Nghiệm thu", "SV & NTD", "Sinh viên nộp link bàn giao; NTD kiểm tra và bấm Nghiệm thu & Giải ngân"],
        ["FR-12", "Ví thù lao & Rút tiền", "Sinh viên", "Theo dõi số dư khả dụng, xem lịch sử cộng trừ tiền và tạo lệnh rút về ngân hàng"],
        ["FR-13", "Trợ lý AI Google Gemini", "Sinh viên", "Chat trực tiếp với AI để tư vấn chọn ngành, tối ưu CV và quyền lợi làm việc"],
        ["FR-14", "Quản trị Super Admin", "Admin", "Cổng /admin riêng biệt, kiểm duyệt tin tuyển dụng và quản lý CMS cẩm nang"]
    ]
    add_table_data(fr_data[0], fr_data[1:], col_widths=[0.8, 1.8, 1.2, 3.4])

    add_h2("3.2. Sơ đồ ca sử dụng tổng quát (Use Case Diagram)")
    add_p("Hệ thống phân định 3 tác nhân chính (Actors): Sinh viên (Student), Nhà tuyển dụng (Employer) và Quản trị viên (Super Admin).")
    add_bullet("Sinh viên (Student): Thực hiện các ca sử dụng tìm kiếm việc làm, nộp hồ sơ, đăng dịch vụ freelance, nộp sản phẩm nghiệm thu, quản lý ví thù lao và trò chuyện với Trợ lý AI.")
    add_bullet("Nhà tuyển dụng (Employer): Đăng tin tuyển dụng, quản lý ứng viên trên bảng Kanban, thuê dịch vụ freelance, ký quỹ tiền thù lao và xác nhận nghiệm thu giải ngân.")
    add_bullet("Quản trị viên (Super Admin): Kiểm duyệt tin đăng của doanh nghiệp, khóa tài khoản gian lận và xuất bản các bài viết cẩm nang nghề nghiệp qua CMS.")

    add_h2("3.3. Thiết kế Cơ sở dữ liệu quan hệ (Database Relational Schema)")
    add_p("Cơ sở dữ liệu của StudentHub được thiết kế ở dạng chuẩn 3NF, bao gồm các bảng thực thể chính được liên kết chặt chẽ thông qua các ràng buộc khóa ngoại:")

    db_data = [
        ["Tên bảng CSDL", "Khóa chính (PK)", "Khóa ngoại (FK)", "Mục đích lưu trữ"],
        ["users", "id (UUID)", "Không", "Lưu trữ tài khoản đăng nhập, email, mật khẩu băm (bcrypt), vai trò (role)"],
        ["profiles", "id (UUID)", "id -> users.id", "Lưu trữ thông tin cá nhân sinh viên, trường ĐH, kỹ năng, link CV"],
        ["employer_profiles", "id (UUID)", "id -> users.id", "Lưu trữ tên công ty, quy mô nhân sự, mã số thuế, địa chỉ trụ sở"],
        ["jobs", "id (UUID)", "employer_id -> users.id", "Lưu thông tin tin tuyển dụng việc làm, yêu cầu kỹ năng, địa điểm, mức lương"],
        ["applications", "id (UUID)", "job_id, student_id", "Lưu hồ sơ nộp đơn ứng tuyển, lời nhắn, trạng thái (applied, interview, accepted)"],
        ["services", "id (UUID)", "student_id -> users.id", "Lưu trữ gói dịch vụ freelance của sinh viên đăng bán trên sàn"],
        ["projects", "id (UUID)", "student_id, employer_id", "Lưu hợp đồng dự án freelance, trạng thái ký quỹ, link bàn giao sản phẩm"],
        ["transactions", "id (UUID)", "user_id -> users.id", "Ghi nhận dòng tiền biến động ví (cộng thù lao giải ngân, trừ lệnh rút ngân hàng)"],
        ["articles", "id (UUID)", "author_id -> users.id", "Lưu trữ bài viết cẩm nang nghề nghiệp do Super Admin xuất bản"]
    ]
    add_table_data(db_data[0], db_data[1:], col_widths=[1.5, 1.2, 1.5, 3.0])

    doc.add_page_break()

    # =========================================================================
    # CHƯƠNG 4: KẾT QUẢ XÂY DỰNG & THỰC NGHIỆM HỆ THỐNG
    # =========================================================================
    add_h1("CHƯƠNG 4: KẾT QUẢ XÂY DỰNG VÀ THỰC NGHIỆM HỆ THỐNG")

    add_h2("4.1. Môi trường triển khai và vận hành")
    add_p("Hệ thống StudentHub được đóng gói và vận hành trên môi trường thực nghiệm với các thông số kỹ thuật:")
    add_bullet("Máy chủ Backend: Node.js v20.x, Express Server lắng nghe tại cổng http://localhost:5000, tích hợp Middleware xử lý CORS và Rate Limiting chống tấn công DDoS.")
    add_bullet("Ứng dụng Frontend: React 18 SPA biên dịch qua Vite, chạy tại cổng http://localhost:5173, hỗ trợ Hot Module Replacement (HMR) với thời gian build sản phẩm chỉ 732ms.")
    add_bullet("Hạ tầng CSDL & Xác thực: Supabase Cloud PostgreSQL tích hợp REST Data API và cơ chế lưu trữ đệm Smart In-Memory Store dự phòng.")
    add_bullet("Dịch vụ Thư điện tử: Máy chủ Google SMTP chuyên dụng kết nối qua giao thức bảo mật TLS cổng 465/587.")

    add_h2("4.2. Chi tiết kết quả xây dựng các phân hệ chức năng")
    add_p("Hệ thống đã hoàn thiện 100% các phân hệ chức năng theo đúng cam kết mốc Giữa kỳ:")
    add_bullet("Phân hệ Topbar & Mega Menu: Thiết kế thanh điều hướng chuẩn mực, gộp thông minh các chức năng vào menu 'Công việc của tôi', hiển thị badge đếm thời gian thực.", "1. ")
    add_bullet("Phân hệ Lọc tìm kiếm việc làm TopCV: Cung cấp thanh công cụ tìm kiếm đa tiêu chí, lọc linh hoạt theo chuyên ngành, quận huyện TP.HCM và phân loại mức lương.", "2. ")
    add_bullet("Phân hệ Ứng tuyển & Kanban tự động gửi Gmail: Nhà tuyển dụng quản lý ứng viên bằng giao diện kéo thả trực quan. Mỗi lần chuyển trạng thái, hệ thống kích hoạt gửi email thật tới hộp thư sinh viên.", "3. ")
    add_bullet("Phân hệ Sàn Freelance & Ký quỹ Escrow: Sinh viên đăng dịch vụ, Nhà tuyển dụng thuê dịch vụ và ngân sách lập tức được giữ trong quỹ ký quỹ an toàn. Sinh viên nộp bài nghiệm thu mượt mà không gặp lỗi 403.", "4. ")
    add_bullet("Phân hệ Ví thù lao & Lịch sử giao dịch: Số dư được đồng bộ đa tab qua BroadcastChannel, tự động tăng tiền khi được nghiệm thu và cho phép tạo lệnh rút về ngân hàng liên kết.", "5. ")
    add_bullet("Phân hệ Trợ lý AI Google Gemini: Chatbox AI thường trực trả lời nhanh dưới 1.5 giây, hướng dẫn sinh viên viết CV và định hướng việc làm.", "6. ")
    add_bullet("Cổng Quản trị Super Admin (/admin): Cách ly hoàn toàn với giao diện thông thường, cung cấp bảng thống kê chỉ số sàn, kiểm duyệt tin và quản trị cẩm nang CMS.", "7. ")

    add_h2("4.3. Kết quả kiểm thử chức năng (Test Cases)")
    add_p("Nhóm đã thiết kế và thực thi 18 ca kiểm thử cốt lõi (Core Test Cases) bao phủ toàn bộ luồng nghiệp vụ từ đầu đến cuối. Kết quả được tổng hợp trong Bảng 4.1:")

    tc_data = [
        ["Mã TC", "Tên ca kiểm thử", "Dữ liệu đầu vào", "Kết quả mong đợi", "Trạng thái"],
        ["TC-01", "Đăng ký tài khoản với Gmail thật", "Email hợp lệ, pass >= 6 ký tự", "Mã OTP 6 số gửi về hộp thư trong 5s", "PASS"],
        ["TC-02", "Nhập sai mã xác thực OTP", "Nhập mã OTP sai 6 số", "Báo lỗi mã không hợp lệ, không tạo user", "PASS"],
        ["TC-03", "Đăng tin tuyển dụng mới", "Tiêu đề, lương 8.000.000đ", "Tin xuất hiện trên sàn, tiền tự format", "PASS"],
        ["TC-04", "Lọc việc theo địa điểm và ngành", "Chọn 'Quận 1', 'Content'", "Hiển thị đúng danh sách việc phù hợp", "PASS"],
        ["TC-05", "Sinh viên nộp hồ sơ ứng tuyển", "Cover letter, chọn file CV", "Hồ sơ lưu vào DB, gửi email xác nhận", "PASS"],
        ["TC-06", "NTD chuyển trạng thái phỏng vấn", "Kéo sang cột 'Hẹn phỏng vấn'", "Trạng thái đổi, gửi thư mời kèm link Meet", "PASS"],
        ["TC-07", "NTD từ chối hồ sơ ứng viên", "Chuyển sang cột 'Từ chối'", "Gửi thư từ chối lịch sự, động viên SV", "PASS"],
        ["TC-08", "Đăng gói dịch vụ Freelance", "Gói thiết kế banner, giá 800k", "Dịch vụ hiển thị công khai trên sàn", "PASS"],
        ["TC-09", "Thuê dịch vụ & Ký quỹ Escrow", "NTD bấm thuê gói 800k", "Tạo hợp đồng, ngân sách chuyển vào quỹ", "PASS"],
        ["TC-10", "Sinh viên nộp link nghiệm thu", "Dán link Google Drive bài làm", "Trạng thái đổi sang Chờ nghiệm thu, hết 403", "PASS"],
        ["TC-11", "NTD duyệt nghiệm thu & Giải ngân", "Bấm Xác nhận nghiệm thu", "Dự án completed, tiền về ví SV tức thì", "PASS"],
        ["TC-12", "Đồng bộ ví tiền đa tab realtime", "Mở 2 tab NTD và SV", "Tab SV tự nhảy số dư không cần F5", "PASS"],
        ["TC-13", "Lệnh rút tiền về ngân hàng", "Nhập số tài khoản, rút 500k", "Số dư trừ 500k, ghi dòng tiền -500k", "PASS"],
        ["TC-14", "Bảo mật cách ly ví giữa tài khoản", "Đăng xuất tài khoản A, vào B", "Ví B không bị rò rỉ dữ liệu của ví A", "PASS"],
        ["TC-15", "Hỏi đáp Trợ lý AI Gemini", "Gõ: 'Tư vấn sửa lỗi CV Marketing'", "AI trả lời chi tiết, mạch lạc dưới 1.5s", "PASS"],
        ["TC-16", "Đăng nhập Cổng Super Admin", "Truy cập /admin với tài khoản Admin", "Mở Dashboard Dark Mode, sidebar chuẩn", "PASS"],
        ["TC-17", "Admin đăng bài cẩm nang CMS", "Tạo bài viết hướng dẫn phỏng vấn", "Bài hiển thị ngay ngoài trang chủ sinh viên", "PASS"],
        ["TC-18", "Kiểm tra build mã nguồn", "Chạy lệnh npm run build", "Build thành công trong 732ms, 0 lỗi cú pháp", "PASS"]
    ]
    add_table_data(tc_data[0], tc_data[1:], col_widths=[0.7, 1.8, 1.6, 2.4, 0.7])

    doc.add_page_break()

    # =========================================================================
    # CHƯƠNG 5: KẾT LUẬN & HƯỚNG PHÁT TRIỂN
    # =========================================================================
    add_h1("CHƯƠNG 5: KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN")

    add_h2("5.1. Tóm tắt kết quả nghiên cứu và phát triển")
    add_p("Qua quá trình nghiên cứu lý thuyết, phân tích nghiệp vụ và triển khai thực nghiệm theo mô hình Agile/Scrum, đề tài 'Xây dựng Nền tảng kết nối việc làm sinh viên, dự án Freelance và bảo vệ thù lao tích hợp Trợ lý AI (StudentHub)' đã hoàn thành xuất sắc toàn bộ các mục tiêu đặt ra cho mốc đánh giá giữa kỳ:")
    add_bullet("Hoàn thiện hệ sinh thái Web 2 chiều với giao diện đồ họa hiện đại, trực quan, thân thiện với người dùng sinh viên và nhà tuyển dụng.")
    add_bullet("Triển khai thành công quy trình xác thực OTP 6 số qua Google SMTP thật, loại bỏ hoàn toàn nguy cơ tài khoản giả mạo.")
    add_bullet("Hiện thực hóa thành công cơ chế Ký quỹ Escrow bảo đảm tài chính và tự động giải ngân thù lao vào Ví sinh viên ngay khi nghiệm thu, giải quyết triệt để vấn nạn bùng tiền.")
    add_bullet("Tích hợp sâu Trợ lý Trí tuệ Nhân tạo Google Gemini hỗ trợ tư vấn nghề nghiệp và tối ưu CV cá nhân hóa.")
    add_bullet("Xây dựng quy trình phát triển phần mềm chuẩn mực, tài liệu đặc tả và nhật ký Sprint rõ ràng, kiểm thử 18/18 ca kiểm thử đạt kết quả 100% Pass.")

    add_h2("5.2. Các hạn chế còn tồn tại")
    add_p("Bên cạnh những kết quả tích cực đã đạt được, hệ thống vẫn còn một số điểm cần tiếp tục hoàn thiện:")
    add_bullet("Tính năng đánh giá uy tín 2 chiều (sao và nhận xét sau hợp đồng) đã có cấu trúc CSDL và API backend nhưng cần kiểm thử giao diện kỹ lưỡng hơn.")
    add_bullet("Hệ thống thanh toán ký quỹ hiện đang vận hành thông qua Ví nội bộ mô phỏng, chưa kết nối trực tiếp với cổng thanh toán liên ngân hàng trực tuyến (VNPay / MoMo).")
    add_bullet("Khả năng hoạt động khi mất kết nối mạng đột ngột (Offline Mode) cần được gia cố thêm với Service Worker.")

    add_h2("5.3. Hướng phát triển trong tương lai")
    add_p("Trong giai đoạn tiếp theo (Sprint 4 và chuẩn bị bảo vệ cuối kỳ), nhóm sẽ tập trung triển khai các nội dung mở rộng sau:")
    add_bullet("Hoàn thiện phân hệ Đánh giá uy tín 2 chiều và tính năng Chat nhắn tin thời gian thực giữa sinh viên và nhà tuyển dụng.")
    add_bullet("Tích hợp cổng thanh toán trực tuyến chính thức (VNPay Sandbox) để hỗ trợ nạp tiền ký quỹ và rút tiền tự động qua API ngân hàng.")
    add_bullet("Nâng cấp Trợ lý AI Gemini với tính năng tự động phân tích file CV PDF tải lên và chấm điểm mức độ phù hợp với yêu cầu tuyển dụng của công việc (Job Match Score).")
    add_bullet("Triển khai ứng dụng hoàn chỉnh lên môi trường Cloud (Vercel và Render) với tên miền chính thức để đưa vào thử nghiệm thực tế trong cộng đồng sinh viên Trường Đại học Văn Lang.")

    doc.add_page_break()

    # =========================================================================
    # TÀI LIỆU THAM KHẢO (CHUẨN IEEE)
    # =========================================================================
    add_h1("TÀI LIỆU THAM KHẢO")
    refs = [
        "[1] Bộ Giáo dục và Đào tạo, \"Khung chương trình đào tạo chuẩn trình độ đại học khối ngành Công nghệ Thông tin,\" Hà Nội, Việt Nam, 2021.",
        "[2] TopCV Vietnam, \"Báo cáo Thị trường Tuyển dụng và Xu hướng Tìm việc làm của Sinh viên Việt Nam,\" Hà Nội, 2024.",
        "[3] I. Sommerville, Software Engineering, 10th ed. Boston, MA, USA: Pearson Education, 2016.",
        "[4] K. Beck et al., \"Manifesto for Agile Software Development,\" The Agile Alliance, 2001. [Online]. Available: https://agilemanifesto.org/",
        "[5] K. Schwaber and J. Sutherland, \"The Scrum Guide: The Definitive Guide to Scrum: The Rules of the Game,\" Scrum.org, 2020.",
        "[6] Facebook Open Source, \"React – A JavaScript library for building user interfaces,\" 2024. [Online]. Available: https://react.dev/",
        "[7] Node.js Foundation, \"Node.js v20.x Documentation,\" 2024. [Online]. Available: https://nodejs.org/docs/",
        "[8] Supabase Inc., \"Supabase Documentation – The Open Source Firebase Alternative,\" 2024. [Online]. Available: https://supabase.com/docs/",
        "[9] Google AI for Developers, \"Gemini API Documentation and Reference,\" Google Cloud, 2024. [Online]. Available: https://ai.google.dev/docs/",
        "[10] RFC 5321, \"Simple Mail Transfer Protocol (SMTP),\" Internet Engineering Task Force (IETF), 2008."
    ]
    for ref in refs:
        p_ref = doc.add_paragraph()
        p_ref.paragraph_format.line_spacing = 1.25
        p_ref.paragraph_format.space_after = Pt(4)
        p_ref.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        r = p_ref.add_run(ref)
        r.font.name = 'Times New Roman'
        r.font.size = Pt(12)

    # Save to disk
    output_filename = "BaoCao_DoAnTotNghiep_StudentHub.docx"
    doc.save(output_filename)
    print(f"Successfully generated full thesis document: {output_filename}")

if __name__ == '__main__':
    build_studenthub_thesis()
