import express, { NextFunction } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import mongoose from "mongoose";
const bodyParser = require("body-parser");
require("dotenv").config();

// Routes
const authRequest = require("./routes/auth-routes");
const userRequest = require("./routes/user-routes");

const app = express();

const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50000,
  message: "Too many requests from this IP, please try again after 15 minutes",
});

app.use(apiLimiter);
app.use(
  helmet({
    contentSecurityPolicy: process.env.NODE_ENV === "production" ? true : false,
  })
);

app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;

// Routes
app.use("/api", authRequest);
app.use("/api/user", userRequest);

// app.use((error:Error, req:Request, res:Response, next:NextFunction) => {
//   if (res.headerSent) {
//     return next(error);
//   }
//   res.status(error.code || 500);
//   res.json({ message: error.message || "An unknow error occured!" });
// });

app.get("/", (req: any, res: any) => {
  res.send("Server is live!");
});

mongoose
  .connect(process.env.ATLAS_URI as string)
  .then(() => {
    console.info("Connected to MongoDB database");
  })
  .catch((error) => {
    console.error(error);
  });

app.listen(PORT, () => {
  console.info("Server is running on port 5000!🥳");
});
