"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const bookingController_1 = require("../controllers/bookingController");
const router = express_1.default.Router();
router.post("/create", authMiddleware_1.protect, bookingController_1.createBooking);
router.get("/my", authMiddleware_1.protect, bookingController_1.getMyBookings);
router.patch("/cancel/:id", authMiddleware_1.protect, bookingController_1.cancelBooking);
router.patch("/status/:id", authMiddleware_1.protect, bookingController_1.updateBookingStatus);
exports.default = router;
