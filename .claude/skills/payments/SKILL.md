---
name: payments
description: Work on TsStark Academy's payment path — the Bonum checkout, the webhook, invoice settlement, enrolment on purchase, the admin payments screen, or the mock mode used for local testing. Use for anything involving money, invoices, `settle_payment`, `BONUM_*` environment variables, or a purchase that did not open a course.
---

# Payments

## The shape of it

```
EnrollButton → POST /api/checkout → payments row (pending) → Bonum invoice
                                                                   ↓
                              enrolment ← settle_payment() ← POST /api/webhooks/bonum
```

## The rules

1. **The gateway is the only authority on whether money moved.** Nothing opens a
   course anywhere else. If you find yourself writing an enrolment next to a
   successful HTTP response, stop.
2. **The price is read from the course row on the server.** A price that arrives
   with the request is a price the buyer chose.
3. **The buyer is the signed-in user**, never an id from the body.
4. The `payments` row is written **as the buyer**, so the policy checks it
   (`user_id = auth.uid()`, `status = 'pending'`) instead of this code promising.
5. `settle_payment()` marks the invoice and creates the enrolment **in one
   transaction**, and is idempotent — gateways retry, and a second delivery must
   not mint a second enrolment.
6. The checksum is HMAC-SHA256 over the **raw request body**, compared in
   constant time. `JSON.parse` then `JSON.stringify` is not the raw body.
7. `createServiceSupabase()` has exactly one legitimate caller: the webhook.
   (Mock mode borrows it, behind `NODE_ENV !== "production"`.)

## Testing without a merchant account

```bash
BONUM_MOCK=1   # in apps/web/.env.local
```

The checkout route then settles the invoice itself and returns a local URL, so
buy → enrol → lesson unlocked can be walked end to end. It is refused in
production by the `NODE_ENV` test — that test is the safety, not a convention.

To test the real gateway, set `BONUM_MOCK=0` and point `BONUM_API_BASE_URL` at
`https://testapi.bonum.mn`. The callback must be reachable from the internet
(a tunnel), or the invoice is created and nothing ever hears the answer.

## When a payment did not open a course

In order:

1. `/mn/admin/payments` — what does the row say? `pending` past 30 minutes is
   stale: the callback never arrived.
2. The server log for `[bonum] webhook rejected: bad checksum` — a wrong
   `BONUM_MERCHANT_CHECKSUM_KEY` rejects every callback.
3. `settle_payment` raising `P0002` means the `invoice_id` on the row and the
   one in the callback disagree.
4. The admin screen's **Гараар баталгаажуулах** writes the same pair the
   function does. Use it to unblock the student, then fix the cause.
