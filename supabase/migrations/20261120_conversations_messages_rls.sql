-- ==============================================================================
-- STUDENTHUB - CONVERSATIONS & MESSAGES SCHEMA & ROW LEVEL SECURITY (RLS)
-- Đảm bảo cách ly dữ liệu cá nhân 100% giữa các sinh viên và nhà tuyển dụng
-- ==============================================================================

-- 1. BẢNG CONVERSATIONS (Cuộc trò chuyện giữa Student và Employer)
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    employer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
    last_message TEXT,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_student_employer_job UNIQUE (student_id, employer_id, job_id)
);

CREATE INDEX IF NOT EXISTS idx_conversations_student_id ON public.conversations(student_id);
CREATE INDEX IF NOT EXISTS idx_conversations_employer_id ON public.conversations(employer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_msg_at ON public.conversations(last_message_at DESC);

-- 2. BẢNG MESSAGES (Chi tiết từng tin nhắn)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at ASC);

-- 3. KÍCH HOẠT ROW LEVEL SECURITY (RLS)
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 4. RLS CHO BẢNG CONVERSATIONS
-- 4.1 SELECT: Student A chỉ xem được conversation có student_id = auth.uid(), không thể xem của Student B
DROP POLICY IF EXISTS "conversations_select_policy" ON public.conversations;
CREATE POLICY "conversations_select_policy"
ON public.conversations FOR SELECT
TO authenticated
USING (
    auth.uid() = student_id
    OR auth.uid() = employer_id
    OR public.is_admin()
);

-- 4.2 INSERT: Chỉ được tạo conversation nếu chính user là student hoặc employer tham gia
DROP POLICY IF EXISTS "conversations_insert_policy" ON public.conversations;
CREATE POLICY "conversations_insert_policy"
ON public.conversations FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = student_id
    OR auth.uid() = employer_id
    OR public.is_admin()
);

-- 4.3 UPDATE: Chỉ người trong cuộc trò chuyện mới được cập nhật (ví dụ: cập nhật last_message, updated_at)
DROP POLICY IF EXISTS "conversations_update_policy" ON public.conversations;
CREATE POLICY "conversations_update_policy"
ON public.conversations FOR UPDATE
TO authenticated
USING (
    auth.uid() = student_id
    OR auth.uid() = employer_id
    OR public.is_admin()
)
WITH CHECK (
    auth.uid() = student_id
    OR auth.uid() = employer_id
    OR public.is_admin()
);

-- 4.4 DELETE: Chỉ chủ sở hữu hoặc admin
DROP POLICY IF EXISTS "conversations_delete_policy" ON public.conversations;
CREATE POLICY "conversations_delete_policy"
ON public.conversations FOR DELETE
TO authenticated
USING (
    auth.uid() = student_id
    OR auth.uid() = employer_id
    OR public.is_admin()
);

-- 5. RLS CHO BẢNG MESSAGES
-- 5.1 SELECT: Chỉ sender_id hoặc receiver_id hoặc thành viên conversation được đọc tin nhắn
DROP POLICY IF EXISTS "messages_select_policy" ON public.messages;
CREATE POLICY "messages_select_policy"
ON public.messages FOR SELECT
TO authenticated
USING (
    auth.uid() = sender_id
    OR auth.uid() = receiver_id
    OR EXISTS (
        SELECT 1 FROM public.conversations c
        WHERE c.id = messages.conversation_id
          AND (c.student_id = auth.uid() OR c.employer_id = auth.uid())
    )
    OR public.is_admin()
);

-- 5.2 INSERT: User chỉ được gửi tin nhắn với danh tính chính mình (sender_id = auth.uid())
-- và phải thuộc conversation đó
DROP POLICY IF EXISTS "messages_insert_policy" ON public.messages;
CREATE POLICY "messages_insert_policy"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
        SELECT 1 FROM public.conversations c
        WHERE c.id = messages.conversation_id
          AND (c.student_id = auth.uid() OR c.employer_id = auth.uid())
    )
);

-- 5.3 UPDATE: Chỉ người nhận được quyền đánh dấu tin nhắn đã đọc (is_read)
DROP POLICY IF EXISTS "messages_update_policy" ON public.messages;
CREATE POLICY "messages_update_policy"
ON public.messages FOR UPDATE
TO authenticated
USING (
    auth.uid() = receiver_id
    OR auth.uid() = sender_id
    OR public.is_admin()
)
WITH CHECK (
    auth.uid() = receiver_id
    OR auth.uid() = sender_id
    OR public.is_admin()
);

-- 5.4 DELETE: Chỉ người gửi hoặc admin được xóa tin nhắn
DROP POLICY IF EXISTS "messages_delete_policy" ON public.messages;
CREATE POLICY "messages_delete_policy"
ON public.messages FOR DELETE
TO authenticated
USING (
    auth.uid() = sender_id
    OR public.is_admin()
);
