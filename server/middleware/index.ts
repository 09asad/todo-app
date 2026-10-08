import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const SECRET = process.env.JWT_SECRET!;

export const authenticateJwt = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token;

  if (!token) {
      return res.sendStatus(401);
  }

  jwt.verify(token, SECRET, (
      err: VerifyErrors | null,
      payload: string | JwtPayload | undefined
    ) => {
      if (err) {
        return res.sendStatus(403);
      }

      if (!payload || typeof payload === "string") {
        return res.sendStatus(403); 
      }

      req.headers["userId"] = payload.id;

      next();
    }
  );
};


