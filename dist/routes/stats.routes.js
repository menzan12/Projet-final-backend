"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const statsController_1 = require("../controllers/statsController");
const router = (0, express_1.Router)();
router.get("/vendor", authMiddleware_1.protect, statsController_1.getVendorStats);
exports.default = router;
