import mongoose from "mongoose";
const axios = require("axios");
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

//models
import { User } from "../models/user";

const sendUserDetails = async (req: any, res: any) => {
  try {
    const userId = req.userData.userId;

    const user = await User.findOne({ _id: userId }).select(
      "-accessToken -createdAt"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    return res.status(200).json({ user: user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  sendUserDetails,
};
