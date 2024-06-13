import { Result, UIError } from "../types";

export const isError = (result: Result<any>): result is UIError => {
  return (result as UIError).uiError !== undefined;
};
