const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

// Thư mục lưu trữ tạm / local fallback
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình Multer lưu tạm bộ nhớ (Memory Storage) để upload lên Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp'
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file định dạng PDF hoặc ảnh (PNG, JPEG, WEBP)'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Tối đa 5MB cho CV & Avatar
  fileFilter
});

// Xử lý upload lên Cloudinary (hoặc fallback lưu local disk)
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Vui lòng đính kèm file cần tải lên' });
    }

    const { type = 'cv' } = req.body; // 'cv' hoặc 'avatar'
    const folder = type === 'avatar' ? 'vlu_freelance/avatars' : 'vlu_freelance/cvs';
    const isPdf = req.file.mimetype === 'application/pdf';

    // 1. Nếu đã cấu hình Cloudinary: Upload trực tiếp lên Cloud Object Storage
    if (isCloudinaryConfigured()) {
      const resourceType = isPdf ? 'raw' : 'image';
      
      const uploadPromise = new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: resourceType,
            format: isPdf ? 'pdf' : undefined,
            public_id: `${Date.now()}_${path.parse(req.file.originalname).name.replace(/[^a-zA-Z0-9]/g, '_')}`
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      const result = await uploadPromise;

      return res.status(200).json({
        success: true,
        message: 'Tải file lên Cloud Object Storage (Cloudinary) thành công!',
        storage: 'cloudinary',
        file_url: result.secure_url,
        public_id: result.public_id,
        bytes: result.bytes,
        format: result.format
      });
    }

    // 2. Chế độ Fallback Local Disk (khi chạy offline / chưa nhập key)
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = `${uniqueSuffix}-${req.file.originalname.replace(/\s+/g, '_')}`;
    const filePath = path.join(uploadDir, filename);

    fs.writeFileSync(filePath, req.file.buffer);

    const localUrl = `/uploads/${filename}`;
    return res.status(200).json({
      success: true,
      message: 'Tải file thành công (Lưu trữ cục bộ Local Storage)',
      storage: 'local_disk',
      file_url: localUrl,
      filename
    });
  } catch (error) {
    console.error('Lỗi khi tải file lên:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải file lên hệ thống',
      error: error.message
    });
  }
};

module.exports = {
  upload,
  uploadFile
};
