import express from "express";
import { protect } from "../middlewares/authMiddleware";
import { 
  createBooking, 
  getMyBookings, 
  cancelBooking, 
  updateBookingStatus 
} from "../controllers/bookingController";

const router = express.Router();

router.post("/create", protect, createBooking);
router.get("/my", protect, getMyBookings);
router.patch("/cancel/:id", protect, cancelBooking);
router.patch("/status/:id", protect, updateBookingStatus);

export default router;