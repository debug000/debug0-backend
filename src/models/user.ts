import type { PaginateModel, Types } from "mongoose";
import { Schema, model, models } from "mongoose";
import validator from "validator";
import mongoosePaginate from "mongoose-paginate-v2";

export interface IUser {
  _id: Types.ObjectId;
  image?: string | null;
  name?: string | null;
  email?: string | null;
  registeredAs: string;
  githubUsername: string;
  projectUrl?: string | null;
  projectImage?: string | null;
  pr: Array<{
    issueUrl: string;
    repoUrl: string;
    title: string;
    created_At: Date;
    closed_At: Date;
  }>;
  createdAt: Date;
}

/**
 * @param image - User Image URL
 * @param name - User name
 * @param email - User email id
 * @param registeredAs - User registered as maintainer/contributor
 * @param githubUsername - GitHub username of the User
 * @param projectUrl - URL of the user's project (if applicable)
 * @param projectImage - URL of the project's image (if applicable)
 * @param createdAt - Date when the user account was created
 * @param pr - Array of Pull Request objects
 *   - issueUrl: URL of the related issue
 *   - repoUrl: URL of the repository
 *   - title: Title of the Pull Request
 *   - created_At: Date of creation of Pull Request
 *   - closed_At: Date of closing of Pull Request
 */

const userSchema = new Schema<IUser>({
  image: { type: String },
  name: { type: String },
  email: {
    type: String,
    // validate: [validator.isEmail, "Invalid email address"],
  },
  registeredAs: { type: String, required: true },
  githubUsername: { type: String, required: true },
  projectUrl: { type: String },
  projectImage: { type: String },
  pr: [
    {
      issueUrl: { type: String, required: true },
      repoUrl: { type: String, required: true },
      title: { type: String, required: true },
      created_At: { type: Date, required: true },
      closed_At: { type: Date, required: true },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

userSchema.plugin(mongoosePaginate);

const userModel = (): PaginateModel<IUser> =>
  model<IUser, PaginateModel<IUser>>("User", userSchema);

export const User =
  models.User || (userModel() as ReturnType<typeof userModel>);
