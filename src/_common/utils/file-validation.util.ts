export function imageFileFilter(req, file, cb) {
  if (!file.mimetype.match(/^image\/(jpeg|png|jpg|webp)$/)) {
    return cb(new Error('Yalnız şəkil faylları qəbul olunur!'), false);
  }
  cb(null, true);
}

export function pdfFileFilter(req, file, cb) {
  if (file.mimetype !== 'application/pdf') {
    return cb(new Error('Yalnız PDF faylları qəbul olunur!'), false);
  }
  cb(null, true);
}

export const imageMaxSize = 2 * 1024 * 1024; // 2MB
export const pdfMaxSize = 10 * 1024 * 1024; // 10MB 