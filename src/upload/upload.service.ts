import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

@Injectable()
export class UploadService {
  saveFile(file: Express.Multer.File, folder: 'images' | 'pdfs') {
    const uploadPath = join(process.cwd(), 'public', 'uploads', folder);
    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
    }
    // Fayl artıq Multer tərəfindən saxlanılır, sadəcə path qaytarırıq
    return {
      url: `/uploads/${folder}/${file.filename}`,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    };
  }
} 