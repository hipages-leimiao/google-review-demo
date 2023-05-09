import fs from "fs";
export interface IUserInfo {
    refreshToken: string;
    accountId: string;
    locationId: string;
}
export class FsStore {
  filename = "store.json";
  constructor() {}

  async get() {
    try {
      const data = await fs.promises.readFile(this.filename, "utf8");
      return JSON.parse(data);
    } catch (err) {
      if (err?.code === "ENOENT") {
        // File doesn't exist, return an empty object
        return {};
      }
      throw err;
    }
  }

  async set(data: IUserInfo) {
    const jsonData = JSON.stringify(data);

    try {
      await fs.promises.writeFile(this.filename, jsonData);
    } catch (err) {
      throw err;
    }
  }
}
