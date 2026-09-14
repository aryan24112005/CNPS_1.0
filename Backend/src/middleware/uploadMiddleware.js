import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.resolve("uploads/courses");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      extension;

    cb(null, uniqueName);
  },
});

const allowedImages = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const allowedPdf = [
  "application/pdf",
];

const fileFilter = (req, file, cb) => {
  // Image field
  if (file.fieldname === "image") {
    if (allowedImages.includes(file.mimetype)) {
      return cb(null, true);
    }

    return cb(
      new Error(
        "Course image must be JPG, JPEG, PNG or WEBP."
      ),
      false
    );
  }

  // Fee PDF
  if (file.fieldname === "fee_pdf") {
    if (allowedPdf.includes(file.mimetype)) {
      return cb(null, true);
    }

    return cb(
      new Error("Fee structure must be a PDF file."),
      false
    );
  }

  // Timetable PDF
  if (file.fieldname === "timetable_pdf") {
    if (allowedPdf.includes(file.mimetype)) {
      return cb(null, true);
    }

    return cb(
      new Error("Timetable must be a PDF file."),
      false
    );
  }

  return cb(
    new Error("Invalid upload field."),
    false
  );
};

const upload = multer({
  storage,
  fileFilter,

  limits: {
    fileSize: 20 * 1024 * 1024,   // 20 MB 
    files: 3,
  },
});

export default upload;