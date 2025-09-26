const { get } = require("mongoose");
const {
  getAllProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  rateProduct,
  deleteRating,
  updateRating,
} = require("../controllers/productController");
const {
  validateCreateProduct,
  validateUpdateProduct,
} = require("../middlewares/validators/productValidations");
const { isValidID } = require("../middlewares/validations");
const { checkRole, checkTokenAndAttachUser } = require("../middlewares/verfiy");

const router = require("express").Router();

router
  .route("/")
  .get(getAllProducts)
  .post(checkRole("admin", "manager"), validateCreateProduct, createProduct);

router
  .route("/:id")
  .get(isValidID, getProduct)
  .put(
    checkRole("admin", "manager"),
    isValidID,
    validateUpdateProduct,
    updateProduct
  )
  .delete(checkRole("admin", "manager"), isValidID, deleteProduct);

router.post("/:id/rate", checkTokenAndAttachUser, isValidID, rateProduct);
router.delete("/:id/rate", checkTokenAndAttachUser, isValidID, deleteRating);
router.put("/:id/rate", checkTokenAndAttachUser, isValidID, updateRating);

module.exports = router;
