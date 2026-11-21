import pptx
from pptx.util import Pt, Inches
from pptx.dml.color import RGBColor

def update_shape(shape, text_items, font_size=None, font_bold=None, font_name=None, color_rgb=None, align=None, word_wrap=True, width=None):
    tf = shape.text_frame
    tf.word_wrap = word_wrap
    if width is not None:
        shape.width = width
    
    t_name = font_name
    t_size = Pt(font_size) if font_size is not None else None
    t_bold = font_bold
    t_rgb = color_rgb
    t_align = align
    
    if tf.paragraphs and tf.paragraphs[0].runs:
        r0 = tf.paragraphs[0].runs[0]
        if t_name is None and r0.font.name:
            t_name = r0.font.name
        if t_size is None and r0.font.size:
            t_size = r0.font.size
        if t_bold is None:
            t_bold = r0.font.bold
        if t_rgb is None:
            try:
                if r0.font.color and r0.font.color.type == pptx.enum.dml.MSO_COLOR_TYPE.RGB:
                    t_rgb = r0.font.color.rgb
            except Exception:
                pass
                
    if t_align is None and tf.paragraphs:
        t_align = tf.paragraphs[0].alignment
        
    if t_name is None:
        t_name = 'Gotham'

    if isinstance(text_items, str):
        paras = text_items.split('\n')
    else:
        paras = text_items

    p0 = tf.paragraphs[0]
    p0.text = ''
    while len(tf.paragraphs) > 1:
        p_elem = tf.paragraphs[-1]._p
        p_elem.getparent().remove(p_elem)

    for idx, p_item in enumerate(paras):
        p = p0 if idx == 0 else tf.add_paragraph()
        if t_align is not None:
            p.alignment = t_align
        
        if isinstance(p_item, tuple):
            p_txt = p_item[0]
            p_sz = Pt(p_item[1]) if p_item[1] is not None else t_size
            p_bld = p_item[2] if len(p_item) > 2 else t_bold
            p_c = p_item[3] if len(p_item) > 3 else t_rgb
        else:
            p_txt = p_item
            p_sz = t_size
            p_bld = t_bold
            p_c = t_rgb
            
        run = p.add_run()
        run.text = p_txt
        run.font.name = t_name
        if p_sz is not None:
            run.font.size = p_sz
        if p_bld is not None:
            run.font.bold = p_bld
        if p_c is not None:
            run.font.color.rgb = p_c

def main():
    prs_path = r'D:\CDTN2\Báo cáo giữa kỳ StudentHub.pptx'
    prs = pptx.Presentation(prs_path)
    print(f'Opened presentation with {len(prs.slides)} slides.')

    # ==========================================
    # SLIDE 1: Title
    # ==========================================
    s1 = prs.slides[0]
    # Shape 3: 'StudentHub' (giữ nguyên)
    update_shape(s1.shapes[4], [
        'Nền tảng kết nối việc làm sinh viên & Freelance',
        'Bảo vệ thù lao tích hợp Trợ lý AI Gemini'
    ], font_size=42, font_bold=True)
    update_shape(s1.shapes[5], 'Báo cáo giữa kỳ đồ án', font_size=28, font_bold=True)
    update_shape(s1.shapes[6], 'Nhóm: 11', font_size=24)
    update_shape(s1.shapes[7], [
        'Thành viên: Nguyễn Minh Phú (Backend Lead)',
        'Thành viên: Hà Đại Vĩ (Frontend Lead)'
    ], font_size=22)
    update_shape(s1.shapes[8], 'Giảng viên hướng dẫn: ThS. Nguyễn Văn Trung', font_size=24)
    print('Slide 1 updated.')

    # ==========================================
    # SLIDE 2: Problem & Solution
    # ==========================================
    s2 = prs.slides[1]
    update_shape(s2.shapes[1], 'Bài toán thực tiễn và Giải pháp', font_size=72, font_bold=True)
    update_shape(s2.shapes[3], [
        '• Khó tìm việc part-time & freelance đúng chuyên ngành',
        '• Rủi ro quỵt tiền, chậm thù lao sau khi hoàn thành dự án',
        '• Thiếu kỹ năng viết CV chuẩn & kinh nghiệm phỏng vấn'
    ], font_size=20, font_bold=True)
    update_shape(s2.shapes[5], 'StudentHub', font_size=44, font_bold=True)
    update_shape(s2.shapes[6], [
        'Cầu nối số hóa toàn diện',
        'Ký quỹ Escrow bảo vệ thù lao',
        'Trợ lý AI Gemini đồng hành'
    ], font_size=22, font_bold=True)
    update_shape(s2.shapes[8], [
        '• Khó tiếp cận nguồn nhân lực sinh viên trẻ chất lượng cao',
        '• Tốn nhiều thời gian lọc CV và đối soát ứng viên thủ công',
        '• Cần cơ chế ký quỹ trung gian để bảo đảm tiến độ dự án'
    ], font_size=20, font_bold=True)
    print('Slide 2 updated.')

    # ==========================================
    # SLIDE 3: Target Roles & Objectives
    # ==========================================
    s3 = prs.slides[2]
    update_shape(s3.shapes[1], 'Ai sử dụng hệ thống? (Đối tượng & Mục tiêu)', font_size=72, font_bold=True)
    update_shape(s3.shapes[3], 'Sinh viên', font_size=36, font_bold=True)
    update_shape(s3.shapes[4], [
        '• Tạo CV online & ứng tuyển 1-click',
        '• Nhận việc freelance có ký quỹ bảo vệ',
        '• Nhờ Trợ lý AI gợi ý việc làm & sửa CV'
    ], font_size=19)
    update_shape(s3.shapes[6], 'Nhà tuyển dụng', font_size=36, font_bold=True)
    update_shape(s3.shapes[7], [
        '• Đăng tin tuyển dụng & dự án freelance',
        '• Quản lý ứng viên kéo thả trên Kanban',
        '• Nghiệm thu và giải ngân ví tự động'
    ], font_size=19)
    update_shape(s3.shapes[9], 'Quản trị viên', font_size=36, font_bold=True)
    update_shape(s3.shapes[10], [
        '• Phê duyệt hồ sơ doanh nghiệp & tin đăng',
        '• Giám sát ví Escrow, xử lý tranh chấp',
        '• Thống kê việc làm & an ninh hệ thống'
    ], font_size=19)
    print('Slide 3 updated.')

    # ==========================================
    # SLIDE 4: Business Process
    # ==========================================
    s4 = prs.slides[3]
    update_shape(s4.shapes[1], 'Quy trình nghiệp vụ & Thực thi dự án', font_size=72, font_bold=True)
    update_shape(s4.shapes[2], '1.', font_size=130, font_bold=True)
    update_shape(s4.shapes[3], [
        'Đăng tin & Ký quỹ Escrow',
        'NTD đăng tin / dự án và nạp tiền ký quỹ tạm giữ thù lao an toàn.'
    ], font_size=22, font_bold=True)
    update_shape(s4.shapes[5], 'Vai trò: Nhà tuyển dụng', font_size=24, font_bold=True)

    update_shape(s4.shapes[6], '2.', font_size=130, font_bold=True)
    update_shape(s4.shapes[7], [
        'Ứng tuyển & Nhận việc',
        'Sinh viên tối ưu CV bằng AI, nộp hồ sơ và ký hợp đồng thực hiện.'
    ], font_size=22, font_bold=True)
    update_shape(s4.shapes[9], 'Vai trò: Sinh viên', font_size=24, font_bold=True)

    update_shape(s4.shapes[10], '3.', font_size=130, font_bold=True)
    update_shape(s4.shapes[11], [
        'Nghiệm thu & Giải ngân ví',
        'NTD đánh giá bài nộp, nghiệm thu trên Kanban và giải ngân tự động.'
    ], font_size=22, font_bold=True)
    update_shape(s4.shapes[13], 'Vai trò: NTD & Sinh viên', font_size=24, font_bold=True)
    print('Slide 4 updated.')

    # ==========================================
    # SLIDE 5: Mid-term Progress
    # ==========================================
    s5 = prs.slides[4]
    update_shape(s5.shapes[4], 'Tiến độ giữa kỳ theo chức năng', font_size=72, font_bold=True)
    update_shape(s5.shapes[5], 'Chức năng', font_size=24, font_bold=True)
    update_shape(s5.shapes[6], 'Trạng thái', font_size=24, font_bold=True)
    update_shape(s5.shapes[7], 'Minh chứng kỹ thuật', font_size=24, font_bold=True)
    update_shape(s5.shapes[8], 'Kế hoạch tiếp theo', font_size=24, font_bold=True)

    # Row 1: Xác thực
    update_shape(s5.shapes[28], 'Xác thực & Bảo mật', font_size=20, font_bold=True)
    update_shape(s5.shapes[22], 'Đã xong 100%', font_size=18, font_bold=True)
    update_shape(s5.shapes[23], 'Google SMTP OTP 6 số, JWT Token, Phân quyền 3 vai trò', font_size=15, width=3800000)
    update_shape(s5.shapes[24], 'Cơ chế tự động làm mới session (Refresh Token)', font_size=15, width=3800000)

    # Row 2: Đăng tin
    update_shape(s5.shapes[9], 'Đăng tin tuyển dụng', font_size=20, font_bold=True)
    update_shape(s5.shapes[10], 'Đã xong 100%', font_size=18, font_bold=True)
    update_shape(s5.shapes[11], 'Form chuẩn hóa, bộ lọc TopCV, hỗ trợ việc làm & freelance', font_size=15, width=3800000)
    update_shape(s5.shapes[12], 'Gợi ý từ khóa kỹ năng theo ngành đào tạo', font_size=15, width=3800000)

    # Row 3: Ứng tuyển
    update_shape(s5.shapes[21], 'Ứng tuyển & Hồ sơ', font_size=20, font_bold=True)
    update_shape(s5.shapes[25], 'Đã xong 100%', font_size=18, font_bold=True)
    update_shape(s5.shapes[26], 'Nộp CV PDF/Online, cập nhật trạng thái thời gian thực', font_size=15, width=3800000)
    update_shape(s5.shapes[27], 'Thông báo đẩy qua Email khi có phản hồi mới', font_size=15, width=3800000)

    # Row 4: Quản lý hồ sơ
    update_shape(s5.shapes[13], 'Quản lý Kanban & Duyệt', font_size=20, font_bold=True)
    update_shape(s5.shapes[18], 'Đã xong 100%', font_size=18, font_bold=True)
    update_shape(s5.shapes[19], 'Kéo thả Kanban ứng viên, xem CV trực tuyến, lọc theo rank', font_size=15, width=3800000)
    update_shape(s5.shapes[20], 'Thống kê biểu đồ tỷ lệ chuyển đổi tuyển dụng', font_size=15, width=3800000)

    # Row 5: Freelance
    update_shape(s5.shapes[14], 'Sàn Freelance & Escrow', font_size=20, font_bold=True)
    update_shape(s5.shapes[15], 'Đã xong & Test đạt', font_size=18, font_bold=True)
    update_shape(s5.shapes[16], 'Hợp đồng số, Ký quỹ Escrow, Bàn giao nộp bài & Giải ngân ví', font_size=15, width=3800000)
    update_shape(s5.shapes[17], 'Tích hợp cổng nạp VNPay/MoMo và rút tiền về ngân hàng', font_size=15, width=3800000)
    print('Slide 5 updated.')

    # ==========================================
    # SLIDE 6: Demo Scenario
    # ==========================================
    s6 = prs.slides[5]
    update_shape(s6.shapes[1], 'Kịch bản Demo trực tiếp theo tình huống xuyên suốt', font_size=54, font_bold=True)
    update_shape(s6.shapes[2], 'Tình huống xuyên suốt: Doanh nghiệp ABC Media tuyển Freelancer thiết kế Banner và giải ngân thù lao qua ví StudentHub.', font_size=23, font_bold=True)
    update_shape(s6.shapes[3], '1. Đăng bài & Ký quỹ Escrow', font_size=26, font_bold=True)
    update_shape(s6.shapes[5], '2. SV ứng tuyển & Nộp bài', font_size=26, font_bold=True)
    update_shape(s6.shapes[7], '3. Nghiệm thu & Giải ngân ví', font_size=26, font_bold=True)
    update_shape(s6.shapes[10], 'Kết quả quan sát: Thù lao 500.000đ được giải ngân tự động từ Escrow sang ví sinh viên tức thì, cập nhật lịch sử ví cả 2 bên.', font_size=21, font_bold=True)
    print('Slide 6 updated.')

    # ==========================================
    # SLIDE 7: Testing Results & Deficiencies
    # ==========================================
    s7 = prs.slides[6]
    update_shape(s7.shapes[1], 'Kết quả kiểm thử & Điểm cần hoàn thiện', font_size=64, font_bold=True)
    update_shape(s7.shapes[22], 'Ca kiểm thử chính', font_size=24, font_bold=True)
    update_shape(s7.shapes[18], 'Kết quả thực tế (18/18 Pass)', font_size=24, font_bold=True)
    update_shape(s7.shapes[20], 'Kế hoạch tối ưu', font_size=24, font_bold=True)

    # Row 1
    update_shape(s7.shapes[21], 'Xác thực OTP & Phân quyền vai trò', font_size=18, font_bold=True)
    update_shape(s7.shapes[23], 'Đạt 100% (JWT Token, chặn truy cập chéo vai trò)', font_size=16)
    update_shape(s7.shapes[26], 'Tối ưu thời gian gửi mã qua Google SMTP < 3s', font_size=16)

    # Row 2
    update_shape(s7.shapes[31], 'Đăng tin & Nộp CV ứng tuyển', font_size=18, font_bold=True)
    update_shape(s7.shapes[29], 'Đạt (Lưu CV đúng định dạng, tự điền thông tin SV)', font_size=16)
    update_shape(s7.shapes[30], 'Thêm kiểm tra dung lượng và quét an toàn tệp tải lên', font_size=16)

    # Row 3
    update_shape(s7.shapes[19], 'NTD duyệt ứng viên & Kéo thả Kanban', font_size=18, font_bold=True)
    update_shape(s7.shapes[24], 'Đạt (Đã khắc phục lỗi 403 phân quyền duyệt dự án)', font_size=16)
    update_shape(s7.shapes[27], 'Đồng bộ trạng thái realtime khi mở nhiều tab', font_size=16)

    # Row 4
    update_shape(s7.shapes[17], 'Ký quỹ Escrow, Bàn giao & Giải ngân ví', font_size=18, font_bold=True)
    update_shape(s7.shapes[25], 'Đạt (Ví tự động trừ/cộng, đã cập nhật lịch sử ví NTD)', font_size=16)
    update_shape(s7.shapes[28], 'Tích hợp cổng nạp VNPay/MoMo và rút tiền thực tế', font_size=16)
    print('Slide 7 updated.')

    # ==========================================
    # SLIDE 8: Member Contributions (2 members)
    # ==========================================
    s8 = prs.slides[7]
    update_shape(s8.shapes[0], 'Phân công & Đóng góp của hai thành viên', font_size=64, font_bold=True)

    # Member 1: Nguyễn Minh Phú (Col 1)
    update_shape(s8.shapes[2], 'Nguyễn Minh Phú\nProduct Owner / Backend Lead', font_size=24, font_bold=True)
    update_shape(s8.shapes[3], 'Phụ trách: Kiến trúc CSDL Supabase, 24 REST APIs, Google SMTP, Ký quỹ Escrow & Trợ lý AI Gemini', font_size=15)
    update_shape(s8.shapes[4], 'Kết quả: Hoàn thành 100% backend xác thực OTP, module Escrow giải ngân ví & Chatbot Gemini AI', font_size=15)
    update_shape(s8.shapes[10], 'Minh chứng: Backend Repo, Postman Collection 24 APIs, Module Escrow & AI Service', font_size=15)

    # Member 2: Hà Đại Vĩ (Col 2)
    update_shape(s8.shapes[6], 'Hà Đại Vĩ\nScrum Master / Frontend Lead', font_size=24, font_bold=True)
    update_shape(s8.shapes[7], 'Phụ trách: Dựng giao diện React SPA, Topbar Mega Menu, Bộ lọc TopCV, Bảng Kanban & Sàn Freelance', font_size=15)
    update_shape(s8.shapes[8], 'Kết quả: Hoàn thành 12 màn hình Responsive, Modal nghiệm thu & Tab dịch vụ đã thuê của NTD', font_size=15)
    update_shape(s8.shapes[9], 'Minh chứng: Frontend Repo, Build Vite 0 lỗi, Giao diện Responsive đa thiết bị', font_size=15)
    print('Slide 8 updated.')

    # ==========================================
    # SLIDE 9: Next Plan
    # ==========================================
    s9 = prs.slides[8]
    update_shape(s9.shapes[4], 'Kế hoạch tiếp theo (Sprint cuối kỳ)', font_size=68, font_bold=True)

    # Ưu tiên 1
    update_shape(s9.shapes[5], 'Ưu tiên 1:', font_size=36, font_bold=True)
    update_shape(s9.shapes[6], 'Tích hợp Cổng thanh toán VNPay / MoMo & Rút tiền thực tế', font_size=20, width=4400000)
    update_shape(s9.shapes[7], 'Người phụ trách:\nNguyễn Minh Phú (Backend Lead)', font_size=18, width=4400000)
    update_shape(s9.shapes[8], 'Mốc hoàn thành:\nSprint 4 (Tuần 1 - Tháng 12/2026)', font_size=18, width=4400000)

    # Ưu tiên 2
    update_shape(s9.shapes[9], 'Ưu tiên 2:', font_size=36, font_bold=True)
    update_shape(s9.shapes[10], 'Hệ thống Thông báo đa kênh (Realtime Socket.io & Email)', font_size=20, width=4500000)
    update_shape(s9.shapes[11], 'Người phụ trách:\nHà Đại Vĩ (Frontend Lead)', font_size=18, width=4500000)
    update_shape(s9.shapes[12], 'Mốc hoàn thành:\nSprint 5 (Tuần 2 - Tháng 12/2026)', font_size=18, width=4500000)

    # Ưu tiên 3
    update_shape(s9.shapes[13], 'Ưu tiên 3:', font_size=36, font_bold=True)
    update_shape(s9.shapes[14], 'Kiểm thử chịu tải, Đánh giá bảo mật OWASP & Triển khai Cloud', font_size=20, width=4500000)
    update_shape(s9.shapes[15], 'Người phụ trách:\nNguyễn Minh Phú & Hà Đại Vĩ', font_size=18, width=4500000)
    update_shape(s9.shapes[16], 'Mốc hoàn thành:\nSprint 6 (Tuần 4 - Tháng 12/2026)', font_size=18, width=4500000)
    print('Slide 9 updated.')

    prs.save(prs_path)
    print('SUCCESS: Updated presentation saved to:', prs_path)

if __name__ == '__main__':
    main()
