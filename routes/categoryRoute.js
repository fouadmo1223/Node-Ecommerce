const router = require("express").Router();

const {
  createCategory,
  getAllCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categrotyController");
const { isValidID } = require("../middlewares/validations");
const {
  validateCreateCategory,
  validateUpdateCategory,
} = require("../middlewares/validators/categoryValidations");
const { checkRole } = require("../middlewares/verfiy");

router
  .route("/")
  .get(getAllCategories)
  .post(checkRole("admin", "manager"), validateCreateCategory, createCategory);
router
  .route("/:id")
  .get(isValidID, getCategory)
  .put(
    checkRole("admin", "manager"),
    isValidID,
    validateUpdateCategory,
    updateCategory
  )
  .delete(checkRole("admin", "manager"), isValidID, deleteCategory);

module.exports = router;
