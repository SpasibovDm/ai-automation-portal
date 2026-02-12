const defaultNetworkMessage =
  "Unable to reach the server. Check your connection and try again.";

const toSentenceCase = (value = "") =>
  value.length ? value.charAt(0).toUpperCase() + value.slice(1) : value;

export const getErrorMessage = (error, fallback = "Something went wrong.") => {
  if (!error) {
    return fallback;
  }

  const responseData = error?.response?.data;

  if (!responseData) {
    return defaultNetworkMessage;
  }

  if (typeof responseData.detail === "string" && responseData.detail.trim()) {
    return toSentenceCase(responseData.detail.trim());
  }

  if (Array.isArray(responseData.errors) && responseData.errors.length) {
    const [first] = responseData.errors;
    if (first?.field && first?.message) {
      return `${toSentenceCase(first.field)}: ${first.message}`;
    }
    if (first?.message) {
      return toSentenceCase(first.message);
    }
  }

  if (typeof responseData.message === "string" && responseData.message.trim()) {
    return toSentenceCase(responseData.message.trim());
  }

  return fallback;
};

export default getErrorMessage;
