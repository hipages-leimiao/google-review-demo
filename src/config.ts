export const GOOGLE_CLIENT_ID = "963038504339-9js7qi8avl9kcklnn79b9obackq963h7.apps.googleusercontent.com";
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const SERVER_ROOT_URI = "http://localhost:4000";
const CLIENT_ROOT_URI = process.env.CLIENT_ROOT_URI || "http://localhost:10010"
export const UI_ROOT_URI = `${CLIENT_ROOT_URI}/google-connect/ios/auth`;
export const UI_ROOT_LOCATION_URI = `${CLIENT_ROOT_URI}/google-connect/ios/locations`;
