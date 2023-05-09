import { google } from "googleapis";
import { startCase } from "lodash";
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  SERVER_ROOT_URI,
} from "./config";
import { FsStore, IUserInfo } from "./store";
const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  `${SERVER_ROOT_URI}/auth/google`
);
const fStore = new FsStore();
export const getAuthURL = () => {
  // generate a url that asks permissions for Blogger and Google Calendar scopes
  const scopes = [
    "https://www.googleapis.com/auth/userinfo.profile",
    // "https://www.googleapis.com/auth/userinfo.email",
    // "https://www.googleapis.com/auth/business.manage",
    "https://www.googleapis.com/auth/plus.business.manage",
    // "openid",
  ];

  return oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: "offline",
    prompt: "consent",
    // If you only need one scope you can pass it as a string
    scope: scopes,
  });
};

export const getAuthTokens = async (code: string) => {
  // This will provide an object with the access_token and refresh_token.
  // Save these somewhere safe so they can be used at a later time.
  const res = await oauth2Client.getToken(code);
  console.log(res.tokens, "fetched tokens===");
  oauth2Client.setCredentials(res.tokens);
  return res.tokens;
};
export const getUserInfo = async (tokens: any) => {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials(tokens);
  const { data } = await google.oauth2("v2").userinfo.get({
    auth: oauth2Client,
  });
  fStore.set({
    refreshToken: tokens.refresh_token,
    accountId: String(data.id),
  } as IUserInfo);
  console.log("getUserInfo", data);
  return data;
};
export const getLocations = async (accountId: string, accessToken: string) => {
  const mybusinessInfo = google.mybusinessbusinessinformation({
    version: "v1",
    auth: oauth2Client, // oauth2Client is the authorized client object created in the previous steps
  });
  const {
    data: { locations },
  } = await mybusinessInfo.accounts.locations.list({
    parent: `accounts/${accountId}`,
    readMask: "name,title,storefrontAddress",
  });
  console.log(JSON.stringify(locations), "=====located review data =====");

  if (!locations) {
    return;
  }
  const res = [];
  for (let i = 0; i < locations.length; i++) {
    const location = locations[i];
    const reviewCount = await getReviewCount(
      accountId,
      String(location.name),
      accessToken
    );
    res.push({
      locationId: location.name?.split("/")[1],
      title: location.title,
      address: genAddress(location.storefrontAddress),
      totalReviews: reviewCount,
    });
    console.log(`Location ${location.name} has ${reviewCount} reviews.`);
  }
  return res;
};

const axios = require("axios");
async function getReviewCount(
  accountId: string,
  locationName: string,
  accessToken: string
) {
  let reviewCount = 0;
  try {
    const response = await axios.get(
      `https://mybusiness.googleapis.com/v4/accounts/${accountId}/${locationName}/reviews`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    reviewCount = response?.data?.totalReviewCount ?? 0;
  } catch (error) {
    console.error("Error fetching review count:", error);
  }
  return reviewCount;
}

export const getAccessToken = async (refreshToken: string) => {
  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  const token = await oauth2Client.getAccessToken();
  return token?.token ?? "";
};

export const getLocationWithReviewCounts = async (
  refreshToken: string,
  accountId: string
) => {
  const accessToken = await getAccessToken(refreshToken);
  console.log(accessToken, "====location with review counts");
  return getLocations(accountId, accessToken);
};

const genAddress = (storefrontAddress: any) => {
  const addressLine = startCase(storefrontAddress?.addressLines.join(", "));

  return [
    addressLine ? `${addressLine},` : null,
    startCase(storefrontAddress?.locality),
    storefrontAddress?.administrativeArea,
    storefrontAddress?.postalCode,
  ]
    .filter((v) => v)
    .join(" ");
};
