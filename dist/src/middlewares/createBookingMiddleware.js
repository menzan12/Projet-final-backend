"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkBody = void 0;
const zod_1 = __importDefault(require("zod"));
const slotSchema = zod_1.default.object({
    day: zod_1.default.string(), // ex: "Lundi"
    date: zod_1.default.string(), // ex: "18"
    time: zod_1.default.string(), // ex: "10:00"
});
const createBookingSchema = zod_1.default.object({
    serviceId: zod_1.default.string(),
    slot: slotSchema,
    notes: zod_1.default.string()
});
const checkBody = async (req, res, next) => {
    try {
        const check = createBookingSchema.parse(req.body);
        next();
    }
    catch (error) {
        res.status(400).json({ message: "les données ne sont pas au format attendu" });
    }
};
exports.checkBody = checkBody;
