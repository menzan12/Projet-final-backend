"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const imageController_1 = require("../controllers/imageController");
const router = (0, express_1.Router)();
// Le frontend appelle cette route : /api/image/auth
router.get("/auth", authMiddleware_1.protect, imageController_1.getAuthParams);
router.get("/my-images", authMiddleware_1.protect, imageController_1.getMyImages);
exports.default = router;
