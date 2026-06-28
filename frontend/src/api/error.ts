interface ApiErrorDetail {
  message?: string;
}

interface ApiErrorShape {
  error?:
    | string
    | {
        message?: string;
        details?: ApiErrorDetail[];
      };
}

interface AxiosLikeError {
  response?: {
    data?: ApiErrorShape;
  };
}

export const extractApiErrorMessage = (error: unknown, fallback: string) => {
  const errorPayload = (error as AxiosLikeError).response?.data?.error;

  if (typeof errorPayload === 'string') {
    return errorPayload;
  }

  if (errorPayload?.details?.length) {
    return errorPayload.details
      .map((detail) => detail.message)
      .filter(Boolean)
      .join(', ');
  }

  if (errorPayload?.message) {
    return errorPayload.message;
  }

  return fallback;
};