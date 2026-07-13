import { isAxiosError } from "axios";
import z, { ZodError } from "zod";

interface ParsedError {
  message: string;
  status?: number;
  error?: Record<string, string>;
}

export function parseAxiosError(err: unknown): ParsedError {
  if (err instanceof ZodError) {
    const message = z.prettifyError(err);

    const error = err.issues.reduce(
      (e, i) => {
        e[i.path.join(".")] = i.message;
        return e;
      },
      {} as Record<string, string>,
    );

    return { message, error };
  }

  if (isAxiosError(err)) {
    let extractedApiMessage: string | undefined;
    const responseData = err.response?.data;

    if (
      responseData &&
      typeof responseData === "object" &&
      responseData !== null
    ) {
      if (
        "message" in responseData &&
        typeof responseData.message === "string" &&
        responseData.message
      ) {
        extractedApiMessage = responseData.message;
      } else if (
        "error" in responseData &&
        typeof responseData.error === "string" &&
        responseData.error
      ) {
        extractedApiMessage = responseData.error;
      }
    } else if (typeof responseData === "string" && responseData.trim() !== "") {
      extractedApiMessage = responseData;
    }

    return {
      message: extractedApiMessage || err.message || "Unknown error",
      status: err.response?.status,
    };
  }

  if (err instanceof Error) {
    return {
      message: err.message || "Unknown error",
    };
  }

  return {
    message: "Unknown error",
  };
}
