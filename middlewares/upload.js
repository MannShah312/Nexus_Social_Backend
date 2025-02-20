// const multer = require("multer");
// const { CloudinaryStorage } = require("multer-storage-cloudinary");
// const cloudinary = require("../config/cloudinary");

// // ⚡ Storage for images and videos
// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: async (req, file) => ({
//     folder: file.mimetype.startsWith("video") ? "videos" : "images",
//     resource_type: file.mimetype.startsWith("video") ? "video" : "image",
//     public_id: `${Date.now()}-${file.originalname}`,
//   }),
// });

// const upload = multer({ storage });

// module.exports = upload;

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// ⚡ Storage for images and videos
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => ({
    folder: file.mimetype.startsWith("video") ? "videos" : "images",
    resource_type: file.mimetype.startsWith("video") ? "video" : "image",
    public_id: `${Date.now()}-${file.originalname}`,
  }),
});

const upload = multer({ storage });

module.exports = upload;