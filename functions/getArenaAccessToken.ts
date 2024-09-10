import type { Handler } from "@netlify/functions";

/**
 * requestAccessToken for Are.na API
 *
 * done in a function due to CORS restrictions
 */
export const requestAccessToken = async function (
  authCode: string,
  arenaClientId: string,
  arenaClientSecret: string,
  callbackUrl: string = ""
) {
  const url = `https://dev.are.na/oauth/token?client_id=${encodeURIComponent(
    arenaClientId
  )}&client_secret=${arenaClientSecret}&code=${authCode}&grant_type=authorization_code&redirect_uri=${encodeURIComponent(
    callbackUrl
  )}`;
  const resp = await fetch(url, { method: "POST" });
  const json = await resp.json();
  console.log({
    title: "arena access token request",
    json,
  });
  window.localStorage.setItem("arenaAccessToken", json.access_token);
  return json.access_token;
};

export const handler: Handler = async (event: Request, _) => {
  const eventBody = await event.json();
  return {
    body: JSON.stringify({
      access_token: await requestAccessToken(
        eventBody.auth_code,
        process.env.ARENA_UID,
        process.env.ARENA_CLIENT_SECRET
      ),
    }),
    statusCode: 200,
  };
};

export default handler;
