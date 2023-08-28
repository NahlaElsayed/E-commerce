const express = require("express");
const {
  getUserValidator,
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  changeUserPasswordValidator,
  updateUserloggedValidator,
} = require("../utils/validators/userValidator");

const {
  getUsers,
  getUser,
  createUser,
  updataUser,
  deleteUser,
  uploadUserImage,
  resizeImage,
  changeUserPassword,
  getloggedUserData,
  updataLoggedUserPassword,
  updataLoggedUserData,
  deleteLoggedUser,
} = require("../services/userServices");
const authService = require("../services/authServices");

const router = express.Router();
router.use(authService.protect);

router.get("/getMe", getloggedUserData, getUser);
router.put("/changeMyPassword", updataLoggedUserPassword);
router.put("/upataMe", updateUserloggedValidator, updataLoggedUserData);
router.delete("/deleteMe", deleteLoggedUser);
// admin
router.use(authService.allowedTo("admin", "manager"));
router.put(
  "/changePassword/:id",
  changeUserPasswordValidator,
  changeUserPassword
);

router
  .route("/")
  .get(getUsers)
  .post(uploadUserImage, resizeImage, createUserValidator, createUser);
router
  .route("/:id")
  .get(getUserValidator, getUser)
  .put(uploadUserImage, resizeImage, updateUserValidator, updataUser)
  .delete(deleteUserValidator, deleteUser);

module.exports = router;
