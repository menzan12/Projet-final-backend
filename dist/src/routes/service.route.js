"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const serviceController_1 = require("../controllers/serviceController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const serviceLimit_middleware_1 = require("../middlewares/serviceLimit.middleware");
const adminController_1 = require("../controllers/adminController");
const router = express_1.default.Router();
// --- ROUTES PUBLIQUES (Tout le monde) ---
router.get("/", serviceController_1.getAllServices);
router.get("/categories", serviceController_1.getActiveCategories);
router.get("/detail/:id", serviceController_1.getServiceById);
// --- ROUTES PRIVÉES (Vendeurs connectés) ---
router.use(authMiddleware_1.protect); // Middleware de protection pour toutes les routes ci-dessous
// Gestion du compte/quota
router.post('/request-upgrade', adminController_1.requestUpgrade);
// CRUD des services
router.get("/my-services", serviceController_1.getVendorServices);
router.post("/", serviceLimit_middleware_1.checkServiceLimit, serviceController_1.createService); // Vérifie le quota avant création
router.put("/:id", serviceController_1.updateService);
router.delete("/:id", serviceController_1.deleteService);
exports.default = router;
