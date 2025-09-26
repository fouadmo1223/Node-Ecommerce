const { check } = require("express-validator");
const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  toggleBlockUser,
  getMyProfile,
} = require("../controllers/userController");
const {
  validateCreateUser,
  validateUpdateUser,
} = require("../middlewares/validators/userValidations");
const {
  checkRole,
  checkOwnerOrRole,
  checkUserId,
  checkTokenAndAttachUser,
} = require("../middlewares/verfiy");

const router = require("express").Router();

router
  .route("/")
  .get(checkRole("manger,admin"), getAllUsers)
  .post(checkRole("manger"), validateCreateUser, createUser);

router
  .route("/:id")
  .get(checkOwnerOrRole("manger"), getUser)
  .put(checkUserId, validateUpdateUser, updateUser)
  .delete(checkOwnerOrRole("manger"), deleteUser);
router.route("/:id/block").put(checkRole("manger"), toggleBlockUser);

router.get("/my-profile", checkTokenAndAttachUser, getMyProfile);
router.put("/my-profile", checkTokenAndAttachUser, updateUser);

module.exports = router;
