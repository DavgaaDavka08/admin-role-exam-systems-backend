import User from "../models/user.models";

export const existingEmail = async (email: string) => {
  return await User.findOne({ email });
};
