import express from "express";
import cors from "cors";
import { UI_ROOT_LOCATION_URI } from "./config";
import {
  getAuthTokens,
  getAuthURL,
  getLocationWithReviewCounts,
  getUserInfo,
} from "./client";
import { FsStore } from "./store";

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
const fStore = new FsStore();
// Getting login URL
app.get("/auth/google/url", (req, res) => {
  return res.send(getAuthURL());
});

app.get("/auth/google/locations", async (req, res) => {
  const { refreshToken, accountId } = await fStore.get();
  return res.send(await getLocationWithReviewCounts(refreshToken, accountId));
});

// Getting the user from Google with the code
app.get(`/${redirectURI}`, async (req, res) => {
  const code = req.query.code as string;

  const tokens = await getAuthTokens(code);
  const { id_token, access_token, refresh_token } = tokens;

  // Fetch the user's profile with the access token and bearer
  try {
    const googleUser = await getUserInfo(tokens);
    console.log("google user", googleUser);
  } catch (error) {
    console.error(error);
  }

  res.redirect(UI_ROOT_LOCATION_URI);
});

function main() {
  app.listen(port, () => {
    console.log(`App listening http://localhost:${port}`);
  });
}

main();
