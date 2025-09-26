const router = require("express").Router();

const {
  createBrand,
  getAllBrands,
  getBrand,
  updateBrand,
  deleteBrand,
} = require("../controllers/brandController");

const { isValidID } = require("../middlewares/validations");
const {
  validateCreateBrand,
  validateUpdateBrand,
} = require("../middlewares/validators/brandValidations");
const { checkRole } = require("../middlewares/verfiy");

router
  .route("/")
  .get(getAllBrands)
  .post(checkRole("admin", "manager"), validateCreateBrand, createBrand);

router
  .route("/:id")
  .get(isValidID, getBrand)
  .put(
    checkRole("admin", "manager"),
    isValidID,
    validateUpdateBrand,
    updateBrand
  )
  .delete(checkRole("admin", "manager"), isValidID, deleteBrand);

module.exports = router;
