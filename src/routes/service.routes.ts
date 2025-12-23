import express, { Request, Response, NextFunction } from "express";
import { createService, updateService, deleteService, getAllServices } from "../controllers/serviceController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

const restrictToVendor = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (user.role !== "vendor" && user.role !== "admin") {
    return res.status(403).json({ message: "Seuls les vendeurs peuvent effectuer cette action." });
  }
  next();
};

router.post("/create", protect, restrictToVendor, createService);
router.put("/update/:id", protect, updateService);
router.delete("/delete/:id", protect, deleteService);
router.get("/", getAllServices);

export default router;