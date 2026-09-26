# Phone Chat V1 Operations

Phone Chat is a single-owner, opt-in PWA channel. Core owns the authenticated browser API and durable delivery queue; Vision makes outbound-only requests to Core. Discord, remote actions, voice, attachments, skills, and MCP are out of scope for V1.

## Provisioning gate

Do not enable the feature or apply the Prisma schema to a shared database until a non-production Core environment is explicitly provisioned. At minimum, the operator needs:

- A staging Core HTTPS base URL and a staging database connection with permission to apply the reviewed schema.
- The exact Core account ID allowed to use phone chat (`ASCEND_PHONE_OWNER_ID`). Core must fail closed if this is absent.
- A high-entropy, staging-only worker secret (`ASCEND_PHONE_WORKER_TOKEN`) installed in Core and Vision. Never place it in the PWA build or browser storage.
- Vision's configured expected owner ID (`ASCEND_PHONE_OWNER_ID`) and Core URL (`ASCEND_PHONE_CORE_URL`). Vision stays disabled unless `phone_chat.enabled` is explicitly true and all required environment variables are present.
- The PWA deployment's existing `NEXT_PUBLIC_API_URL` pointed to staging Core, with that origin included in Core's trusted `FRONTEND_URL` configuration.

The staging URL and scoped credentials have not been provisioned in the current environment. Therefore no migration, database push, live queue test, or deployment has been performed.

## Safe rollout sequence

1. Review the Prisma model changes and verify backup/restore for the staging database. Validate the schema and generate the local client first; do not use production credentials for this check.
2. Apply the schema only to the provisioned staging database during an approved window.
3. Deploy Core with the owner binding, worker secret, HTTPS frontend origin, and rate limits configured. Verify that an unconfigured owner binding denies registration.
4. Deploy Vision with `phone_chat.enabled: false`; configure the staging URL, staging worker secret, and matching owner ID. Verify the worker secret is absent from all client bundles and logs.
5. Enable the staging PWA and Vision worker. Verify registration, one queued message, one reply, acknowledgement/body deletion, logout/device revoke, and no access from a second device.
6. Stop Vision and send a message; confirm Core retains it only until its configured expiry and that the PWA reports queue status without fabricating a reply. Restart Vision and confirm expired work is not processed.
7. Restart Vision and confirm temporary conversational context is reset. Verify only explicitly approved memories are available, while phone transcripts are not added to long-term memory.
8. Check Core/Vision logs and storage for prompt/reply leakage. Confirm terminal acknowledgement leaves only a body-free tombstone.
9. Keep production disabled until staging evidence is reviewed and a separate production rollout is approved.

## Runtime boundaries

- Browser transcripts live in the tab's `sessionStorage`; the client does not create an offline outbox or cache authenticated chat responses.
- Logout clears tab chat data immediately and stores only pending device IDs in browser `localStorage` until Core confirms revocation. The next authenticated Phone Chat mount retries those revocations before device registration or use.
- Vision holds phone conversation turns in RAM, isolated by owner, channel, and session, with a 60-minute idle expiry. Process restart clears them.
- Core queue bodies are removed on acknowledgement or retention expiry. Tombstones are body-free and short-lived.
- Core owns authorization and device revocation. Vision may only claim, start, renew, and complete jobs with the dedicated worker bearer.
- If Core cannot confirm enqueue, the PWA marks the send unconfirmed rather than retrying it as an offline queue.

## Disable / revoke

To stop processing, disable `phone_chat.enabled` in Vision and restart it. To stop browser access, revoke the device through Phone Chat or clear the account's owner binding in Core. Rotate the worker secret in both services if it may have been exposed. Keep the feature disabled until the incident is understood; do not delete queue tables as an emergency response because retention and audit behavior must remain predictable.
