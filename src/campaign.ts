import { z } from "zod";
import { infrai } from "./infrai_client.ts";

export const campaignMessage = z.object({
  kind: z.enum(["receipt", "reminder"]),
  recipient: z.string().email(),
  name: z.string().min(1),
  campaignId: z.string().min(1),
  amountCents: z.number().int().nonnegative().optional()
});
export type CampaignMessage = z.infer<typeof campaignMessage>;

export function renderMessage(input: CampaignMessage): { subject: string; html: string } {
  if (input.kind === "receipt") {
    return { subject: `Receipt for campaign ${input.campaignId}`, html: `<p>Thank you, ${input.name}. Your gift was recorded.</p>` };
  }
  return { subject: `Volunteer reminder for ${input.campaignId}`, html: `<p>Hi ${input.name}, your campaign reminder is ready.</p>` };
}

export async function deliverCampaignMessage(input: unknown) {
  const message = campaignMessage.parse(input);
  const rendered = renderMessage(message);
  return infrai.email.send({ to: message.recipient, ...rendered }, `${message.campaignId}:${message.kind}:${message.recipient}`);
}

export async function reportCampaign(messageId: string) {
  const events = await infrai.email.event.list(messageId);
  const list = Array.isArray(events) ? events : [];
  return { messageId, opens: list.filter((event) => typeof event === "object" && event !== null && "type" in event && (event as { type?: unknown }).type === "open").length, bounces: list.filter((event) => typeof event === "object" && event !== null && "type" in event && (event as { type?: unknown }).type === "bounce").length };
}
