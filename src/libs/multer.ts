import multer from "multer";
import BadRequestError from "../errors/badRequestError";

const storage = multer.memoryStorage();

const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Accept all image file types
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new BadRequestError("Only image files are allowed!"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 8,
  },
});

export default upload;
