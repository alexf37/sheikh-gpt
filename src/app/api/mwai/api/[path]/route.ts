import { createNextjsHandler } from "modifywithai/nextjs/api";

export { generateStaticParams } from "modifywithai/nextjs/api";

export const dynamicParams = false;

export const { GET, POST, PUT, PATCH, DELETE } = createNextjsHandler({
  appId: "app_b3FoTPYWLRtgyms3gwoFjB",
  getEndUserId: async (_request) => {
    // This app has no authentication system
    // Using a static ID for all users - ModifyWithAI requires a user identifier
    // TODO: Implement proper user identification if authentication is added
    return "anonymous-user";
  },
});
