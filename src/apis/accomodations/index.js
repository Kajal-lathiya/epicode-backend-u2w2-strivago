import express from "express";
import createHttpError from "http-errors";
import hostOnlyMiddleware from "../../library/authentication/hostOnly.js";
import { JWTAuthMiddleware } from "../../library/authentication/jwtAuth.js";
import AccomodationsModel from "./model.js";

const accomodationsRouter = express.Router();

accomodationsRouter.post(
  "/",
  JWTAuthMiddleware,
  hostOnlyMiddleware,
  async (req, res, next) => {
    try {
      const newAccomodation = await AccomodationsModel({
        ...req.body,
        host: req.user._id
      });
      const { _id } = await newAccomodation.save();
      res.status(201).send({ _id });
    } catch (error) {
      next(error);
    }
  }
);

accomodationsRouter.get("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const accomodations = await AccomodationsModel.find().populate({
      path: "host"
    });
    res.send(accomodations);
  } catch (error) {
    next(error);
  }
});

accomodationsRouter.get(
  "/:accomodationId",
  JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      const accomodation = await AccomodationsModel.findById(
        req.params.accomodationId
      ).populate({
        path: "host"
      });
      if (accomodation) {
        res.send(accomodation);
      } else {
        next(
          createHttpError(404, "No accomodations with the provided id found")
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

accomodationsRouter.put(
  "/:accomodationId",
  JWTAuthMiddleware,
  hostOnlyMiddleware,
  async (req, res, next) => {
    try {
      const accomodation = await AccomodationsModel.findById(
        req.params.accomodationId
      );
      if (accomodation) {
        if (accomodation.host.toString() === req.user._id) {
          const updatedAccomodation =
            await AccomodationsModel.findByIdAndUpdate(
              req.params.accomodationId,
              req.body,
              { new: true, runValidators: true }
            );
          res.status(204).send(updatedAccomodation);
        } else {
          next(createHttpError(403, "The accomodation is not yours to update"));
        }
      } else {
        next(
          createHttpError(404, `Accomodation with the provided id not found`)
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

accomodationsRouter.delete(
  "/:accomodationId",
  JWTAuthMiddleware,
  hostOnlyMiddleware,
  async (req, res, next) => {
    try {
      const accomodation = await AccomodationsModel.findById(
        req.params.accomodationId
      );
      if (accomodation) {
        if (accomodation.host.toString() === req.user._id) {
          await AccomodationsModel.findByIdAndDelete(req.params.accomodationId);
          res.status(204).send();
        } else {
          next(createHttpError(403, "The accomodation is not yours to delete"));
        }
      } else {
        next(
          createHttpError(
            404,
            `Accomodation with id ${req.params.accomodationId} not found!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

export default accomodationsRouter;
