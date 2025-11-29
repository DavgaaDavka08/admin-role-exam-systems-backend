import { Request, Response, NextFunction } from "express";

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = req.user?.role;

    if (!role || !allowedRoles.includes(role)) {
      return res.status(403).json({ message: "Хандах эрх байхгүй байна" });
    }

    next();
  };
};
