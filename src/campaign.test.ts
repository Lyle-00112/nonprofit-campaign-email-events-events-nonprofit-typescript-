import assert from "node:assert/strict";
import { renderMessage, campaignMessage } from "./campaign.ts";

const receipt = campaignMessage.parse({ kind: "receipt", recipient: "donor@example.org", name: "Mina", campaignId: "trees", amountCents: 2500 });
assert.equal(renderMessage(receipt).subject, "Receipt for campaign trees");
assert.throws(() => campaignMessage.parse({ kind: "receipt", recipient: "bad", name: "Mina", campaignId: "trees" }));
console.log("campaign decision test passed");
