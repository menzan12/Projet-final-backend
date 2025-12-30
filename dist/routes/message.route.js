"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const messageController_1 = require("../controllers/messageController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// POST /api/messages -> Pour envoyer (Fonctionne)
router.post("/", authMiddleware_1.protect, messageController_1.sendMessage);
// GET /api/messages/my -> Pour lire tes messages (C'est celle-ci qu'il faut tester)
router.get("/my", authMiddleware_1.protect, messageController_1.getMyMessages);
exports.default = router;
