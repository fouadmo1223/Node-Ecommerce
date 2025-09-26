const router = require("express").Router();
const {
  createSubCategory,
  getSubCategory,
  updateSubCategory,
  deleteSubCategory,
  getAllSubCategories,
} = require("../controllers/subCategoryController");
const { isValidID } = require("../middlewares/validations");
const {
  validateCreateSubCategory,
} = require("../middlewares/validators/subCategoryValidations");

router
  .route("/")

  .post(validateCreateSubCategory, createSubCategory)
  .get(getAllSubCategories);

router
  .route("/:id")
  .get(isValidID, getSubCategory)
  .put(validateCreateSubCategory, isValidID, updateSubCategory)
  .delete(isValidID, deleteSubCategory);

module.exports = router;
