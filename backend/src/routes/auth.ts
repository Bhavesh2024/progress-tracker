import express from "express";
import { rateLimit } from "express-rate-limit";
import passport from "passport";
const otpLimiter = rateLimit({
	windowMs: 24 * 60 * 60 * 1000,
	limit: 3,
	legacyHeaders: false,
});
const router = express.Router();
const {
	handleLogin,
	checkLogin,
	handleForgotPassword,
	handleUserVerification,
	handleResetPasswordVerification,
	handleCodeVerification,
	handleSendOTP,
	handleLogout,
} = require("../controllers/auth");
router.post("/login", handleLogin);
router.get("/login", checkLogin);
router.post("/verification", handleUserVerification);
router.post("/send-otp", otpLimiter, handleSendOTP);
router.post("/forgot-password", handleForgotPassword);
router.get("/:role/verify/:token", handleResetPasswordVerification);
router.post("/code-verification", handleCodeVerification);
router.post(
	"/logout",
	passport.authenticate("jwt", { session: false }),
	handleLogout,
);
module.exports = router;
