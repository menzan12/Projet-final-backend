"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bookingController_1 = require("../controllers/bookingController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.use(authMiddleware_1.protect); // Toutes les routes ci-dessous nécessitent d'être connecté
router.post("/", bookingController_1.createBooking);
router.get("/my", bookingController_1.getMyBookings);
router.patch("/cancel/:id", bookingController_1.cancelBooking);
router.patch("/status/:id", bookingController_1.updateBookingStatus);
exports.default = router;
