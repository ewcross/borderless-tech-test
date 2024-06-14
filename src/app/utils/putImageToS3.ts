import { Result } from "../types";

export const putImageToS3 = async (formData: FormData, url: string): Promise<Result<undefined>> => {
  const file = formData.get("file") as File | undefined;
  if (!file) {
    return { uiError: "There was an error selecting your file, please try again" };
  }
  if (file.type !== "image/jpeg" && file.type !== "image/png") {
    return { uiError: "We can only accept images with .jpeg or .png extensions, please choose one of these" };
  }

  const response = await fetch(url, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type }
  });

  if (response.status !== 200) {
    return { uiError: "There was an error uploading your file, please try again" };
  }
  return { data: undefined };
};
