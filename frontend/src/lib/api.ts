// Centralized API Base URL sanitizer
const getApiBase = () => {
  let envUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Default to relative /api if env is missing or empty
  if (!envUrl || envUrl.trim() === "") {
    return "/api";
  }

  let url = envUrl.trim();

  // Strip trailing slashes
  url = url.replace(/\/+$/, "");

  // If the user provided a full domain without /api (e.g., https://ru-orientation.vercel.app)
  if (!url.endsWith("/api")) {
    url = `${url}/api`;
  }

  return url;
};

export const API_BASE = getApiBase();
