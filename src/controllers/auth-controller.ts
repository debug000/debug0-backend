import mongoose from "mongoose";
const axios = require("axios");
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

//models
import { User } from "../models/user";

const NODE_ENV = process.env.NODE_ENV;
const CLIENT_ID =
  NODE_ENV === "production"
    ? process.env.GITHUB_CLIENT_ID
    : process.env.GITHUB_CLIENT_ID_DEV;
const CLIENT_SECRET =
  NODE_ENV === "production"
    ? process.env.GITHUB_CLIENT_SECRET
    : process.env.GITHUB_CLIENT_SECRET_DEV;

const userGitHubAuthorization = async (req: any, res: any) => {
  const { code, registeredAs } = req.body;
  if (!code || !registeredAs) {
    console.error("Missing some fields!");
    return res.status(400).json({ message: "Missing some fields!" });
  }

  const params = `client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&code=${code}&redirect_uri=${process.env.FRONTEND_URL}`;

  try {
    const response = await axios.post(
      `https://github.com/login/oauth/access_token?${params}`
    );

    const { data } = response;

    const accessToken = data.split("&")[0].split("=")[1];

    //HASHING THE ACCESS TOKEN

    const salt = await bcrypt.genSalt(10);
    const hashedAccessToken = await bcrypt.hash(accessToken, salt);

    //save

    const userResponse = await axios.get("https://api.github.com/user", {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${accessToken}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    if (!userResponse) {
      return res.status(500).json({ message: "Internal Server Error" });
    }

    const userDetails = userResponse.data;

    //check if the user exists
    const existingUser = await User.findOne({
      githubUsername: userDetails.login,
    });

    let user;
    if (!existingUser) {
      user = new User({
        image: userDetails.avatar_url,
        name: userDetails.name,
        email: userDetails.email,
        registeredAs: registeredAs,
        githubUsername: userDetails.login,
      });

      await user.save();
    } else {
      user = existingUser;
    }

    //creating a token
    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1h",
      }
    );

    return res.status(200).json({
      message: "Successfully registered!",
      token: token,
      userId: user._id,
      status: 200,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  userGitHubAuthorization,
};
