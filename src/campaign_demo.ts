import { deliverCampaignMessage } from "./campaign.ts";

const recipient = process.env.DEMO_EMAIL_TO;
if (!recipient) throw new Error("DEMO_EMAIL_TO is required");
const result = await deliverCampaignMessage({ kind: "receipt", recipient, name: "A donor", campaignId: "spring-appeal", amountCents: 2500 });
console.log("receipt sent", result);
