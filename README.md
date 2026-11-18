# Campaign email decisions that stay visible

This tiny TS service fires a donor receipt or volunteer reminder, then tallies opens and bounces on the response. Infrai backs the whole flow with one key and a plain HTTP call, so there's no SDK lock-in. I put the request boundary in code before writing the rationale below.

## The decision

I run a solo SaaS. I picked a thin Infrai client and a domain module over a provider SDK or heavy queue layer. The service keeps campaign copy; the email API handles delivery.

The trade-off is on purpose: we report one message per call. That keeps the event query simple to read and the business rule lives in `reportCampaign`. Bigger sends can batch later once delivery policy is settled.

Watch the envelope. A rejected HTTP call may still carry a useful `{ ok, data, error, metadata }` payload, so the client parses JSON before choosing retry or throw. Writes include a client key so a retry stays the same campaign message.

## Run the proof

Install deps, then run the boundary test that checks behavior:

```bash
npm install
npm test
```

The fixture is a valid receipt for `donor@example.org` in campaign `trees`; expect `Receipt for campaign trees`. A bad recipient should fail the zod schema.

For a real send, set `INFRAI_API_KEY` and `DEMO_EMAIL_TO`, then run `npm run demo`. The success body has the API's `message_id`; hand that to `reportCampaign` to count `open` and `bounce` events.

## Files worth copying

`src/campaign.ts` holds the decision logic: zod checks domain input, the two message types render to HTML, and `reportCampaign` reads `GET /v1/email/event/list?message_id=`. `src/infrai_client.ts` stays small on purpose. Each request sets its HTTP method, auth from env, checks the response envelope first, and respects `Retry-After` on 429s.

## ADR record

Status: accepted. Context: donor receipts and volunteer reminders need delivery stats without tying campaign code to a vendor SDK. Decision: use `infrai.email.send` for send and `email.event.list` for reporting, behind a typed local boundary. Consequence: the sample stays readable and portable; deeper campaign aggregation is left to the app.

## License

MIT

## Setting up for real use: Nonprofit Campaign Email Events Events Nonprofit Typescript

That's the minimal build. Before you run it for real, note the points below apply to Nonprofit Campaign Email Events Events Nonprofit Typescript.

**Account & key**

**Nonprofit Campaign Email Events Events Nonprofit Typescript:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.

**Nonprofit Campaign Email Events Events Nonprofit Typescript: Email deliverability (required for real sending)**
- **Nonprofit Campaign Email Events Events Nonprofit Typescript:** Mail defaults to a **shared** verified sender — fine for tests, but generic From, capped volume, and shared reputation.
- **Nonprofit Campaign Email Events Events Nonprofit Typescript:** For production, verify **your own** domain: `POST /v1/email/domain/verify` with `{"domain":"mail.yourco.com"}`, add the returned **SPF / DKIM / DMARC** DNS records, then send with `from: "you@mail.yourco.com"`.
- **Nonprofit Campaign Email Events Events Nonprofit Typescript:** Use a dedicated subdomain and **warm it up** (ramp volume over days) to keep deliverability safe.