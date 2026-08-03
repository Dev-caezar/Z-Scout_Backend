import multer from "multer";

const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = ["video/mp4", "video/quicktime", "video/webm"];

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(
      new Error("Only MP4, MOV, or WebM video files are allowed."),
      false,
    );
  }
  cb(null, true);
};

export const uploadVideo = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB — adjust to your product's needs
  },
});
