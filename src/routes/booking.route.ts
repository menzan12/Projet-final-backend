import express from "express";
import { protect } from "../middlewares/authMiddleware";
import { 
  createBooking, 
  getMyBookings, 
  cancelBooking, 
  updateBookingStatus 
} from "../controllers/bookingController";
import { checkBody } from "../middlewares/createBookingMiddleware";

const router = express.Router();

router.post("/create", checkBody , createBooking);
router.get("/my", protect, getMyBookings);
router.patch("/cancel/:id", protect, cancelBooking);
router.patch("/status/:id", protect, updateBookingStatus);

export default router;