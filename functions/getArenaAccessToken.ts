import type { Handler } from "@netlify/functions";

/**
 * requestAccessToken for Are.na API
 *
 * done in a function due to CORS restrictions
 */
export const requestAccessToken = async function (
  authCode: string,
  callbackUrl: string,
  arenaClientId: string,
  arenaClientSecret: string
) {
  const url = `https://dev.are.na/oauth/token?client_id=${encodeURIComponent(
    arenaClientId
  )}&client_secret=${arenaClientSecret}&code=${authCode}&grant_type=authorization_code&redirect_uri=${encodeURIComponent(
    callbackUrl
  )}`;
  const resp = await fetch(url, { method: "POST" });
  const json = await resp.json();
  console.log({
    title: "arena access token response",
    status: resp.status,
    json,
  });
  return json.access_token;
};

export const handler: Handler = async (event: Request, _) => {
  const eventBody = JSON.parse(event.body);
  console.log({
    UID: process.env.ARENA_UID,
    SECRET: process.env.ARENA_SECRET,
  });
  return {
    body: JSON.stringify({
      access_token: await requestAccessToken(
        eventBody.auth_code,
        eventBody.redirect_uri,
        process.env.ARENA_UID,
        process.env.ARENA_SECRET
      ),
    }),
    statusCode: 200,
  };
};

export default handler;
