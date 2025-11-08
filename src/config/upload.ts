// ========================================
// 文件上传配置
// ========================================

import multer from 'multer';

// 配置存储（使用内存存储，因为要上传到 MinIO）
const storage = multer.memoryStorage();

// 文件过滤器
const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // 只允许图片
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('只支持 jpg, png, gif, webp 格式的图片'));
  }
};

// 创建 multer 实例
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 10 // 最多10张图片
  }
});

// 导出配置
export const uploadConfig = {
  maxFileSize: 5 * 1024 * 1024,
  maxFiles: 10,
  allowedMimes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
};

