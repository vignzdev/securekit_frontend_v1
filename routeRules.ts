export const routeRules: Record<string, "public" | "protected"> = {
  "/": "public",
  "/login": "public",
  "/register": "public",
  "/reset-password": "public",
  "/auth/callback": "public",

  "/dashboard": "protected",
  "/api-key": "protected",
  "/analytics": "protected",
  "/settings": "protected",
  "/custom-list": "protected",
};
