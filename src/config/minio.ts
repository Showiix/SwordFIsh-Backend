// ========================================
// MinIO 对象存储配置
// ========================================

import * as Minio from 'minio';
import config from './index';

// MinIO 客户端配置
export const minioClient = new Minio.Client({
  endPoint: config.minio.endPoint,
  port: config.minio.port,
  useSSL: config.minio.useSSL,
  accessKey: config.minio.accessKey,
  secretKey: config.minio.secretKey,
});

// Bucket 名称
export const BUCKETS = {
  PRODUCTS: 'products',        // 商品图片
  AVATARS: 'avatars',          // 用户头像
  DOCUMENTS: 'documents',      // 文档
};

/**
 * 初始化 MinIO Buckets
 * 🤔 为什么需要初始化？
 * 答：确保必需的 bucket 存在，不存在则自动创建
 */
export async function initMinIO(): Promise<void> {
  try {
    console.log('🔧 初始化 MinIO...');

    // 检查并创建 products bucket
    const productsExists = await minioClient.bucketExists(BUCKETS.PRODUCTS);
    if (!productsExists) {
      await minioClient.makeBucket(BUCKETS.PRODUCTS, config.minio.region);
      console.log(`✅ 创建 Bucket: ${BUCKETS.PRODUCTS}`);

      // 设置为公开读取（商品图片需要公开访问）
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${BUCKETS.PRODUCTS}/*`],
          },
        ],
      };
      await minioClient.setBucketPolicy(BUCKETS.PRODUCTS, JSON.stringify(policy));
      console.log(`✅ 设置 Bucket 策略: ${BUCKETS.PRODUCTS} (公开读取)`);
    } else {
      console.log(`✅ Bucket 已存在: ${BUCKETS.PRODUCTS}`);
    }

    // 检查并创建 avatars bucket
    const avatarsExists = await minioClient.bucketExists(BUCKETS.AVATARS);
    if (!avatarsExists) {
      await minioClient.makeBucket(BUCKETS.AVATARS, config.minio.region);
      console.log(`✅ 创建 Bucket: ${BUCKETS.AVATARS}`);

      // 设置为公开读取
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${BUCKETS.AVATARS}/*`],
          },
        ],
      };
      await minioClient.setBucketPolicy(BUCKETS.AVATARS, JSON.stringify(policy));
      console.log(`✅ 设置 Bucket 策略: ${BUCKETS.AVATARS} (公开读取)`);
    } else {
      console.log(`✅ Bucket 已存在: ${BUCKETS.AVATARS}`);
    }

    console.log('✅ MinIO 初始化完成');
  } catch (error) {
    console.error('❌ MinIO 初始化失败:', error);
    throw error;
  }
}

/**
 * 生成文件的公开访问 URL
 */
export function getPublicUrl(bucketName: string, objectName: string): string {
  const protocol = config.minio.useSSL ? 'https' : 'http';
  const port = config.minio.port === 80 || config.minio.port === 443 ? '' : `:${config.minio.port}`;
  return `${protocol}://${config.minio.endPoint}${port}/${bucketName}/${objectName}`;
}
