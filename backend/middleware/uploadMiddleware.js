const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Destination folder for uploads
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueSuffix); // Use a timestamped filename
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/; // Accept only images
    const isAllowed = allowedTypes.test(file.mimetype);
    if (isAllowed) cb(null, true);
    else cb(new Error("Only image files are allowed."), false);
  },
});

module.exports = upload;
