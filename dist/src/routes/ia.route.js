"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const iaController_1 = require("../controllers/iaController");
const router = express_1.default.Router();
router.post("/ask", iaController_1.ChatBotAI);
exports.default = router;
