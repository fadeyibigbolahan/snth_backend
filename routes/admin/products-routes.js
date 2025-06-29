const express = require("express");

const {
  handleImageUpload,
  addProduct,
  editProduct,
  fetchAllProducts,
  deleteProduct,
} = require("../../controllers/admin/products-controller");

// const { upload } = require("../../helpers/cloudinary")
const upload = require("../../middlewares/upload");

const router = express.Router();

// router.post("/upload-image", upload.single("my_file"), handleImageUpload);
router.post("/add", upload.array("images", 5), addProduct);
router.put("/edit/:id", editProduct);
router.delete("/delete/:id", deleteProduct);
router.get("/get", fetchAllProducts);

module.exports = router;
