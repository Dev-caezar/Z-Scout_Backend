import dotenv from "dotenv";
import SibApiV3Sdk from "sib-api-v3-sdk";

dotenv.config();

const client = SibApiV3Sdk.ApiClient.instance;
client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;
console.log("API Key loaded:", !!process.env.BREVO_API_KEY);

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

export default apiInstance;
