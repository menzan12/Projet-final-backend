"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVendorAvailability = exports.createAvailability = void 0;
const VendorAvailability_model_1 = __importDefault(require("../models/VendorAvailability.model"));
const createAvailability = async (req, res) => {
    try {
        const slot = await VendorAvailability_model_1.default.create({
            vendor: req.user.id,
            date: req.body.date,
            startTime: req.body.startTime,
            endTime: req.body.endTime
        });
        res.status(201).json(slot);
    }
    catch (error) {
        res.status(500).json({ message: "Erreur création créneau" });
    }
};
exports.createAvailability = createAvailability;
const getVendorAvailability = async (req, res) => {
    try {
        const slots = await VendorAvailability_model_1.default.find({
            vendor: req.params.vendorId,
            isBooked: false,
            date: { $gte: new Date() }
        }).sort({ date: 1, startTime: 1 });
        res.json(slots);
    }
    catch (error) {
        res.status(500).json({ message: "Erreur récupération créneaux" });
    }
};
exports.getVendorAvailability = getVendorAvailability;
