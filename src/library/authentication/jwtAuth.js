import createHttpError from "http-errors";
import { verifyAccessToken } from "./jwtTools.js";

export const JWTAuthMiddleware = async (req, res, next) => {
  if (!req.headers.authorization) {
    next(
      createHttpError(
        401,
        "You didn't provide a Beared Token in the authorization header. Please provide one."
      )
    );
  } else {
    try {
      const accessToken = req.headers.authorization.replace("Bearer ", "");
      const payload = await verifyAccessToken(accessToken);
      req.user = {
        _id: payload._id,
        role: payload.role,
      };

      next();
    } catch (error) {
      console.log("Error from jwtAuthorization Middleware", error);
      next(createHttpError(401, "The token is not valid"));
    }
  }
};
