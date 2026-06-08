import { config } from "./config.js";

export async function getMessengerProfile(psid) {
  const fields = "first_name,last_name,profile_pic";
  const url = new URL(`https://graph.facebook.com/${config.graphVersion}/${psid}`);
  url.searchParams.set("fields", fields);
  url.searchParams.set("access_token", config.pageAccessToken);

  const response = await fetch(url);
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = body?.error?.message || response.statusText;
    throw new Error(`Meta profile request failed for ${psid}: ${message}`);
  }

  return {
    psid,
    firstName: body.first_name || "",
    lastName: body.last_name || "",
    profilePic: body.profile_pic || "",
    fetchedAt: new Date().toISOString()
  };
}
