import { compareSync, hashSync } from "bcrypt";

export const HashPassword = async (password: string) => {
  const salt = 10;
  return hashSync(password, salt);
};
export const ComparePassword = async (
  password: string,
  hashedPassword: string
) => {
  return compareSync(password, hashedPassword);
};
