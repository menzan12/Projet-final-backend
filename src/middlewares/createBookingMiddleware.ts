import { NextFunction, Request, Response } from "express";
import z from "zod";

const slotSchema = z.object({
    day: z.string(),  // ex: "Lundi"
    date: z.string(), // ex: "18"
    time: z.string(), // ex: "10:00"
  })

const createBookingSchema = z.object({
    serviceId: z.string(),
    slot:slotSchema,
    notes: z.string()
})

 export type ICreateBooking = z.infer <typeof createBookingSchema>

type ISlot = z.infer <typeof slotSchema>

export const checkBody = async (req: Request, res: Response, next: NextFunction) => {

  try {
    const check = createBookingSchema.parse (req.body)
    
    next();
  } catch (error) {
    res.status(400).json({ message: "les données ne sont pas au format attendu" });
  }
};