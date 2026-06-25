import express from "express";
import { register, login, getMe, logout } from "../controllers/authController.js";
import { validateRegistration, validateLogin } from "../validators/authValidators.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", validateRegistration, register);
router.post("/login", validateLogin, login);
router.get("/logout", logout);
router.get("/me", protect, getMe);

export default router;
