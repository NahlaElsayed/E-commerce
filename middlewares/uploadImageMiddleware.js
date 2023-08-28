const multer = require("multer");
const ApiError = require("../utils/apiError");

const multerOptions = () => {
  // 1)diskStorage engine
  // const multerStorage = multer.diskStorage({
  //   destination: function (req, file, cb) {
  //     cb(null, "uploads/categories");
  //   },
  //   filename: function (req, file, cb) {
  //     // category-${id}-Data.now().jpeg
  //     const ext = file.mimetype.split("/")[1];
  //     const filename = `category-${uuidv4()}-${Date.now()}.${ext}`;
  //     cb(null, filename);
  //   },
  // })
  // 2-memory storages engine
  const multerStorage = multer.memoryStorage();

  // ensure image or not (filteration)
  const multerFilter = function (req, file, cb) {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new ApiError("only images allowed", 400), false);
    }
  };
  const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
  return upload;
};

exports.uploadSingleImage = (fieldName) =>multerOptions().single(fieldName)


exports.uploadMixOfImages = (arrayOfFields) =>
multerOptions().fields(arrayOfFields);
