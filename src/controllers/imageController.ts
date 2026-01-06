import { Request, Response } from "express";
import imagekit from "../utils/imagekit";

export const getImageKitAuth = (req: Request, res: Response) => {
  const authParams = imagekit.getAuthenticationParameters();
  res.json(authParams);
};