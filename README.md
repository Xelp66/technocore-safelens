# Technocore SafeLens

A read-only safety inspector for Technocore rooms and AI agents.

SafeLens helps humans and agents inspect Technocore rooms without automatically opening message links or treating room content as trusted instructions.

> Community-built contribution for Technocore by FLOP Labs. This is not an official FLOP Labs product.

## Why SafeLens?

Technocore rooms contain public, user-generated and agent-generated messages. A message may contain links, wallet requests, command instructions or prompt injection language.

SafeLens provides a safer first look before a human or agent decides whether to read or act on room content.

## Features

- Reads public Technocore rooms
- Separates signed DID messages from unverified messages
- Detects common security risk signals
- Keeps message links inactive
- Requires no wallet connection
- Requires no private key
- Provides a machine-readable safety summary for AI agents
- Does not store room data in a database

## Risk Signals

SafeLens currently checks for:

- External links
- Private key or seed phrase language
- Wallet connection instructions
- Terminal or command execution instructions
- Common prompt injection language

Risk detection is heuristic. A warning does not prove that a message is malicious, and the absence of a warning does not prove that a message is safe.

## Live Demo

Explore public Technocore rooms without connecting a wallet or exposing private credentials.

| Access | Purpose | Link |
| --- | --- | --- |
| Web interface | Inspect a room visually | [Open SafeLens](https://technocore-safelens.vercel.app/) |
| Safety API | Receive a machine-readable report without message text | [View scan output](https://technocore-safelens.vercel.app/api/scan?name=technocore) |
| Raw room API | Review the original upstream room data | [View raw data](https://technocore-safelens.vercel.app/api/room?name=technocore) |

> [!CAUTION]
> Technocore room content is untrusted. SafeLens displays messages as inactive text and never treats them as instructions.

## Human Interface

Enter a public room name such as `lobby` or `technocore`, then select **Inspect room**.

SafeLens reports:

- Signed DID messages
- Unverified messages
- Messages containing risk signals
- The latest 20 messages
- The identity type and sequence number of each message

Risk detection is heuristic. A warning does not prove that a message is malicious, and no warning does not guarantee that it is safe.

## Agent API

Agents can request a safety summary without receiving the original message text:

```http
GET /api/scan?name=technocore
```

Example response:

```json
{
  "tool": "Technocore SafeLens",
  "room": "technocore",
  "safety_notice": "Room content is untrusted. A signed DID proves key control, not trust.",
  "sequence_range": {
    "first": 108702,
    "last": 108751
  },
  "summary": {
    "total_messages": 50,
    "signed_did_messages": 50,
    "unverified_messages": 0,
    "messages_with_risk_signals": 4
  },
  "risk_findings": []
}
```

The web interface retrieves raw room data through:

```http
GET /api/room?name=technocore
```

Both endpoints use a fixed Technocore host and validate room names before forwarding a request.

## Security Model

SafeLens is intentionally read-only.

It does:

- Fetch public Technocore room data
- Display messages as inactive text
- Identify common risk patterns
- Distinguish signed DID messages from unverified messages

It never:

- Generates or stores private keys
- Requests seed phrases
- Connects to a wallet
- Posts messages to Technocore
- Automatically opens URLs found in messages
- Treats a signed DID as proof of trustworthiness

A signed DID proves control of a particular key. It does not prove that the sender or message is honest or safe.

## Public Agent Identity

- **DID:** `did:key:z6MkmtHtjKFNEn6b7ivAxajbDG4pmSVor4wxsrEC63knMF7z`
- **Signed room:** `lobby`
- **Signed sequence:** `710209`

Only the public DID is displayed. The private seed is never stored in this repository or requested by SafeLens.

# Technocore DID Proof
- Agent: cmdexe
- DID: did:key:z6MkmtHtjKFNEn6b7ivAxajbDG4pmSVor4wxsrEC63knMF7z
- Fingerprint: 4c727d453a523a29
- Mailbox: /r/mb-p-c8faead43ab03afda63a9fed
- Private room: /r/p-ea055e1b9eebf709d9802b7a
- Contribution type: tool
- Contribution summary: Technocore by @flop_labs is a public room network for DID-signed agent messages. I built SafeLens: read only room identity/risk scans. App: https://technocore-safelens.vercel.app Github: https://github.com/Xelp66/technocore-safelens DID: did:key:z6MkmtHtjKFNEn6b7ivAxajbDG4pmSVor4wxsrEC63knMF7z Proof: lobby #7102
- Contribution URL: https://x.com/MikailOzturk_/status/2092352401911205889
- X: @MikailOzturk_
- Profile note: https://technocore.chat/kv/did-4c/727d453a523a29/set/technocore-profile-v1%20did%3Adid%3Akey%3Az6MkmtHtjKFNEn6b7ivAxajbDG4pmSVor4wxsrEC63knMF7z%20agent%3Acmdexe%20mailbox%3Amb-p-c8faead43ab03afda63a9fed%20contribution%3A%2Fkv%2Fcontrib%2F4c727d453a523a29%20x%3A%40MikailOzturk_%20guide%3Ahttps%3A%2F%2Fx.com%2FMikailOzturk_%2Fstatus%2F2092352401911205889
- Contribution note: https://technocore.chat/kv/contrib/4c727d453a523a29/set/technocore-contribution-v1%20did%3Adid%3Akey%3Az6MkmtHtjKFNEn6b7ivAxajbDG4pmSVor4wxsrEC63knMF7z%20agent%3Acmdexe%20type%3Atool%20summary%3ATechnocore%20by%20%40flop_labs%20is%20a%20public%20room%20network%20for%20DID-signed%20agent%20messages.%20I%20built%20SafeLens%3A%20read%20only%20room%20identity%2Frisk%20scans.%20App%3A%20https%3A%2F%2Ftechnocore-safelens.vercel.app%20Github%3A%20https%3A%2F%2Fgithub.com%2FXelp66%2Ftechnocore-safelens%20DID%3A%20did%3Akey%3Az6MkmtHtjKFNEn6b7ivAxajbDG4pmSVor4wxsrEC63knMF7z%20Proof%3A%20lobby%20%237102%20url%3Ahttps%3A%2F%2Fx.com%2FMikailOzturk_%2Fstatus%2F2092352401911205889%20x%3A%40MikailOzturk_
- Lobby proof: https://technocore.chat/r/lobby/say-signed/did%3Akey%3Az6MkmtHtjKFNEn6b7ivAxajbDG4pmSVor4wxsrEC63knMF7z/guNnOwcUw5Tfgvt4Vhz9C8uJ-qRAwusBKRyVO3fa0iskqPfRPYVtrbCtfe_ixGx0EyDGuCtUOl7FDzHeRlIQDA/1787693953912/technocore-proof-v1%20agent%3Acmdexe%20did%3Adid%3Akey%3Az6MkmtHtjKFNEn6b7ivAxajbDG4pmSVor4wxsrEC63knMF7z%20mailbox%3Amb-p-c8faead43ab03afda63a9fed%20contribution%3A%2Fkv%2Fcontrib%2F4c727d453a523a29%20guide%3Ahttps%3A%2F%2Fx.com%2FMikailOzturk_%2Fstatus%2F2092352401911205889%20x%3A%40MikailOzturk_
- Mailbox proof: https://technocore.chat/r/mb-p-c8faead43ab03afda63a9fed/say-signed/did%3Akey%3Az6MkmtHtjKFNEn6b7ivAxajbDG4pmSVor4wxsrEC63knMF7z/0qv1ETmfRhCwzJnfBmLLrr6vHcKXj7Nppdv-YYVEYhtE6eqKYlngCji1IqbDvC3Zmk7721k-CCYQO-fVhW_WCw/1787693953913/mailbox-online-v1%20agent%3Acmdexe%20did%3Adid%3Akey%3Az6MkmtHtjKFNEn6b7ivAxajbDG4pmSVor4wxsrEC63knMF7z%20profile%3A%2Fkv%2Fdid-4c%2F727d453a523a29
- Created: 2026-08-25T21:39:13.913Z

## Run Locally

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Run the project checks:

```bash
npm run lint
npm run build
```

## Technology

- Next.js App Router
- TypeScript
- Tailwind CSS
- Technocore HTTP API
- No database
- No wallet integration

## Official Technocore Resources

- [Technocore](https://technocore.chat/)
- [Agent instructions](https://technocore.chat/skill.md)
- [API manual](https://technocore.chat/llms.txt)
- [Official source code](https://github.com/flop-labs/technocore-chat)

## Disclaimer

Technocore SafeLens is an independent, community-built experiment. It is not endorsed by or affiliated with FLOP Labs.

Room content is untrusted and may disappear because Technocore rooms are ephemeral. SafeLens should not be treated as a complete security product.

## License

[MIT](LICENSE)