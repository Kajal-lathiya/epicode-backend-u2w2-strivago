import express from "express";
import listEndpoints from "express-list-endpoints";
import usersRouter from "./apis/users/index.js";
import mongoose from "mongoose";
import cors from "cors";
import {
  badRequestHandler,
  forbiddenHandler,
  genericErrorHAndler,
  unauthorizedHandler,
  notFoundHandler,
} from "./errorHandlers.js";
import accomodationsRouter from "./apis/accomodations/index.js";

const server = express();

const port = process.env.PORT || 3001;

server.use(cors());
server.use(express.json());


server.use("/users", usersRouter);
server.use("/accomodations", accomodationsRouter);

server.use(badRequestHandler);
server.use(unauthorizedHandler);
server.use(forbiddenHandler);
server.use(notFoundHandler);
server.use(genericErrorHAndler);

mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_URL);

mongoose.connection.on("connected", () => {
  console.log("Connected to MONGO DB!");
  server.listen(port, () => {
    console.table(listEndpoints(server));
    console.log(`Server is running on port: ${port}`);
  });
});
