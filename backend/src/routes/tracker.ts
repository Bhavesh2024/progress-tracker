import express from "express";
import {
	getTrackerHistory,
	getTrackerTime,
	setTrackerTime,
} from "../controllers/tracker";

const router = express.Router();

router.post("/set-time", setTrackerTime);
router.get("/get-time", getTrackerTime);
router.get("/history", getTrackerHistory);

module.exports = router;
