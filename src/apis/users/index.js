import express from "express";
import mongoose from "mongoose";
import createHttpError from "http-errors";
import UsersModel from "./model.js";
import AccomodationsModel from "../accomodations/model.js";
import hostOnlyMiddleware from "../../library/authentication/hostOnly.js";
import { JWTAuthMiddleware } from "../../library/authentication/jwtAuth.js";
import { createAccessToken } from "../../library/authentication/jwtTools.js";

const usersRouter = express.Router();

usersRouter.post("/", async (req, res, next) => {
  try {
    const newUser = await UsersModel(req.body);
    const { _id } = await newUser.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await UsersModel.checkCredentials(email, password);
    if (user) {
      const payload = { _id: user._id, role: user.role };
      const accessToken = await createAccessToken(payload);
      res.send({ accessToken });
    } else {
      next(createHttpError(401, "Credentials are not ok!"));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/register", async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    const newUser = await UsersModel(req.body);
    await newUser.save();
    if (newUser) {
      const payload = { _id: newUser._id, role: newUser.role };

      const accessToken = await createAccessToken(payload);
      res.status(201).send({ accessToken });
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/", async (req, res, next) => {
  try {
    const users = await UsersModel.find();
    res.send(users);
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.user._id);
    res.send(user);
  } catch (error) {
    next(error);
  }
});

usersRouter.get(
  "/me/accomodations",
  JWTAuthMiddleware,
  hostOnlyMiddleware,
  async (req, res, next) => {
    try {
      const accomodations = await AccomodationsModel.find({
        host: mongoose.Types.ObjectId(req.user._id)
      });
      if (accomodations) {
        res.send(accomodations);
      } else {
        next(
          createHttpError(404, `This host doesn't have any accomodations yet`)
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

export default usersRouter;
