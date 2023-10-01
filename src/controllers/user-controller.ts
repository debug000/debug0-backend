import mongoose from "mongoose";
const axios = require("axios");
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

//models
import { User } from "../models/user";

//helpers
import { extractRepoNameFromUrl } from "../utils/helpers";

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

const fetchAllPullRequests = async (githubUsername: string) => {
  const perPage = 10;
  let page = 1;
  const allPullRequests: any[] = [];

  const octoberFirst2023 = new Date("2023-10-01T00:00:00Z");

  while (true) {
    try {
      const response = await axios.get(
        `https://api.github.com/search/issues?q=hacktoberfest+hacktoberfest-accepted+type:pr+is:closed+author:${githubUsername}&per_page=${perPage}&page=${page}`
      );

      if (response.data.items.length === 0) {
        break;
      }

      const filteredPRs = response.data.items.filter((pr: any) => {
        const createdAt = new Date(pr.created_at);
        return createdAt >= octoberFirst2023;
      });

      allPullRequests.push(...filteredPRs);

      const linkHeader = response.headers["link"];
      if (!linkHeader || !linkHeader.includes('rel="next"')) {
        break;
      }

      page++;
    } catch (error: any) {
      console.error(error.message);
      throw new Error("Failed to fetch pull requests");
    }
  }

  return allPullRequests;
};

const updatePullRequestsForUser = async (user: any) => {
  try {
    const closedPullRequests = await fetchAllPullRequests(user.githubUsername);

    if (closedPullRequests.length > 0) {
      const prArray = closedPullRequests.map((pr: any) => ({
        issueUrl: pr.html_url,
        repoUrl: extractRepoNameFromUrl(pr.repository_url) || "",
        title: pr.title,
        created_At: pr.created_at,
        closed_At: pr.closed_at,
      }));

      await User.updateOne({ _id: user._id }, { $set: { pr: prArray } });
    }
  } catch (error: any) {
    console.error(
      `Failed to update pull requests for ${user.githubUsername}: ${error.message}`
    );
    throw new Error("Failed to update pull request.");
  }
};

const updatePullRequestsForAllUsers = async (req: any, res: any) => {
  try {
    const authToken = req.headers.authorization;
    const secretKey = process.env.JWT_SECRET;

    if (!authToken) {
      return res.status(401).json({ message: "Unauthorized: Token missing" });
    }

    const token = authToken.split(" ")[1];

    try {
      jwt.verify(token, secretKey as string);
      const users = await User.find({});

      await Promise.all(users.map(updatePullRequestsForUser));

      return res
        .status(200)
        .json({ message: "Updated the PRs of all the users." });
    } catch (error) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
  } catch (error: any) {
    console.error(
      `Failed to update pull requests for all users: ${error.message}`
    );
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  sendUserDetails,
  updatePullRequestsForAllUsers,
};
