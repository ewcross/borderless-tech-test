import { Result, UserError } from "../types";

export const isError = (result: Result<any>): result is UserError => {
  return (result as UserError).userError !== undefined;
};
