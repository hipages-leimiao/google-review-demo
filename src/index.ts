import express from "express";
import cors from "cors";
import { UI_ROOT_LOCATION_URI } from "./config";
import { getAuthTokens, getAuthURL, getLocations, getUserInfo } from "./client";

const port = 4000;

const app = express();

app.use(
  cors({
    // Sets Access-Control-Allow-Origin to the UI URI
    // origin: UI_ROOT_URI,
    // Sets Access-Control-Allow-Credentials to true
    credentials: true,
  })
);

const redirectURI = "auth/google";

// Getting login URL
app.get("/auth/google/url", (req, res) => {
  return res.send(getAuthURL());
});

// Getting the user from Google with the code
app.get(`/${redirectURI}`, async (req, res) => {
  const code = req.query.code as string;

  const tokens = await getAuthTokens(code);
  const { id_token, access_token, refresh_token } = tokens;

  // Fetch the user's profile with the access token and bearer
  try {
    const googleUser = await getUserInfo(tokens);
    console.log("refresh token", refresh_token);

    console.log("id token", id_token);
    console.log("google user", googleUser);
    console.log(
      "locations:",
      await getLocations(String(googleUser.id), String(access_token))
    );
  } catch (error) {
    console.error(error);
  }

  res.redirect(UI_ROOT_LOCATION_URI);
});

// Getting the current user
app.get("/auth/me", (req, res) => {
  console.log("get me");
});

function main() {
  app.listen(port, () => {
    console.log(`App listening http://localhost:${port}`);
  });
}

main();
