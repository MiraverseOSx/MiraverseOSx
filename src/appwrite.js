import { Client, Databases } from "appwrite";

const client = new Client()
  .setEndpoint("https://nyc.cloud.appwrite.io/v1") // your endpoint
  .setProject("6a63807c003ba118d773"); // your project ID

export const databases = new Databases(client);
