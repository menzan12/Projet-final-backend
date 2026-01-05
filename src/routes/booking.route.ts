import express from "express";
import { 
    createBooking, 
    getMyBookings, 
    cancelBooking, 
    updateBookingStatus 
} from "../controllers/bookingController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

router.use(protect); // Toutes les routes ci-dessous nécessitent d'être connecté

router.post("/", createBooking);
router.get("/my", getMyBookings);
router.get("/vendor", getMyBookings);
router.patch("/cancel/:id", cancelBooking);
router.patch("/status/:id", updateBookingStatus);

export default router;