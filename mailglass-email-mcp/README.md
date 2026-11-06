# MailGlass Email MCP

[![npm version](https://img.shields.io/npm/v/mailglass-email-mcp)](https://www.npmjs.com/package/mailglass-email-mcp)
[![Docker image](https://img.shields.io/docker/v/anantanandgupta/mailglass-email-mcp)](https://hub.docker.com/r/anantanandgupta/mailglass-email-mcp)

A **read-only** MCP server for searching and reading email, built around a provider abstraction with
Gmail as the first provider.

It answers questions like *"find every invoice from Acme since January"* and *"what did Jane say in
that thread?"*, and it does nothing else. No sending, no deleting, no labelling, no marking as
read. Each call queries the provider live.

> **Your mail never leaves your machine.** MailGlass operates no servers, collects no telemetry, and
> transmits nothing to us. It caches locally under `~/.mailglass` for speed; you choose the location
> and can switch caching off entirely.

**Documentation:**
https://mcp.anantanandgupta.net/mailglass-email-mcp/

Or go straight to a page:

- [Install](https://mcp.anantanandgupta.net/mailglass-email-mcp/install/)
- [Create a Gmail app password](https://mcp.anantanandgupta.net/mailglass-email-mcp/app-password/)
- [Tools](https://mcp.anantanandgupta.net/mailglass-email-mcp/tools/)
- [Configuration](https://mcp.anantanandgupta.net/mailglass-email-mcp/configuration/)

---

## What it does

| Tool | Purpose |
|---|---|
| `list_folders` | Enumerate folders and labels |
| `search_emails` | Query mail; returns sender, subject, date, attachment flag, message id, thread id |
| `count_emails` | Count matches without returning them |
| `get_email` | Read one message's headers and text body |
| `get_thread` | Read a conversation as an ordered list, oldest first |
| `list_attachments` | List a message's attachments with index, type and size |
| `get_attachment` | Save an attachment locally, or return an image inline with `inline: true` |
| `server_info` | Configuration, accounts and index state; optional live connectivity check |

`get_attachment` returns a **path by default**. Pass `inline: true` to receive an image as an image
content block instead: opt-in, because images cost vision tokens and are untrusted input (text
inside an image is a prompt-injection vector you can't cheaply scan). Images above ~4 MB fall back
to a file, and non-image attachments are always written to disk.

## What it deliberately does not do

Send, draft, reply, forward, delete, trash, archive, move, label or unlabel, mark as
read/unread, filters, vacation responder, send-as aliases, cross-session memory.

Write capabilities exist in the type system but are **withheld by the `readOnly` gate**, which
defaults to `true`.

---

## Providers

Gmail is the reference provider; generic IMAP is the portable one. Capabilities are declared per
provider, so a tool that cannot work is either absent or explains itself rather than failing oddly.

| Provider | Transport | Threads | Attachment filter | Query language |
|---|---|---|---|---|
| `gmail` | Gmail IMAP + `X-GM-EXT-1` | native (`X-GM-THRID`) | `has:attachment` | full Gmail syntax |
| `imap` | standard IMAP | reconstructed from headers (may be partial) | **not supported** | plain `SEARCH` |

### Per-tool support

| Tool | `gmail` | `imap` |
|---|---|---|
| `list_folders` | ✅ full | ✅ full; no `archive`/`starred`/`important` |
| `search_emails` | ✅ full | ⚠️ partial: plain `SEARCH`, no operators |
| `count_emails` | ✅ `ESEARCH` | ✅ `ESEARCH`, else UID count |
| `get_email` | ✅ | ✅ |
| `get_thread` | ✅ authoritative | ⚠️ reconstructed, may report `partial` |
| `list_attachments` | ✅ | ✅ |
| `get_attachment` | ✅ | ✅ |
| `server_info` | ✅ | ✅ |

### Search filters

| Filter | `gmail` | `imap` |
|---|---|---|
| `from` / `subject` | ✅ | ✅ |
| `unread` | ✅ | ✅ |
| `keyword` | ✅ full query syntax (`from:`, `label:`, `larger:`, `OR`, …) | ⚠️ literal text only; operators are not interpreted |
| `has_attachment` | ✅ | ❌ refused with an explanatory error |
| `after` / `before` | ✅ Gmail date semantics | ⚠️ `INTERNALDATE` (arrival), not the `Date` header |
| `folder` / `limit` / `cursor` | ✅ | ✅ |

### Behaviour that differs

| | `gmail` | `imap` |
|---|---|---|
| Message identity | `X-GM-MSGID`, survives moves | `folder + UIDVALIDITY + UID`, **stale after a move or reindex** (clear error; re-run the search) |
| `thread_id` in results | populated | always `null`; pass `message_id` to `get_thread` |
| Folder model | labels, multi-membership, All Mail | one home per message, no All Mail |
| Connect + login | ~2.5 s (Gmail throttles auth) | ~170 ms |

### Asking what an account can do

`server_info` reports, per account, the provider capabilities **and a per-tool support map**, so an
agent knows before calling whether `get_thread` is authoritative, reconstructed, or refused.

```jsonc
{
  "accounts": [
    { "id": "dev", "provider": "gmail",
      "capabilities": ["search","count","read","thread","attachments","has_attachment_filter","native_query"],
      "tools": { "search_emails": "full", "get_thread": "full", "...": "full" } },
    { "id": "inpos", "provider": "imap",
      "capabilities": ["search","count","read","attachments"],
      "tools": { "search_emails": "partial", "get_thread": "partial", "...": "full" } }
  ]
}
```

Support levels are `full`, `partial` and `unsupported`. Tools are registered for the whole server
(the union across accounts), so per-account limitations are enforced at call time with an
explanatory error rather than a silently missing tool.

### Configuring a generic IMAP account

`host` is required for `imap`; everything else has defaults.

```jsonc
{
  "defaultAccount": "work",
  "providers": { "imap": { "readOnly": true } },
  "accounts": [
    {
      "id": "work",
      "provider": "imap",
      "email": "me@example.com",
      "auth": {
        "username": "me@example.com",          // may differ from the email address
        "password": { "env": "WORK_IMAP_PASSWORD" }
      },
      "connection": {
        "host": "mail.example.com",
        "port": 993,                            // 993 implicit TLS, 143 STARTTLS
        "secure": true,
        "rejectUnauthorized": true              // false only for self-signed certs
      }
    }
  ]
}
```

---

## Requirements

- **Node.js 22.13+**: uses the built-in `node:sqlite` for the local index. On older runtimes the
  index disables itself with a warning and everything else still works.
- A provider account. For Gmail: 2-Step Verification enabled, an app password, and IMAP allowed in
  Gmail settings.

---

## Install

### npm

```bash
npm install -g mailglass-email-mcp
mailglass --version
```

### Docker

```bash
docker run -i --rm \
  -v "$PWD/config.json:/cfg/config.json:ro" \
  -e MAILGLASS_CONFIG=/cfg/config.json \
  anantanandgupta/mailglass-email-mcp
```

There are no ports to expose: this is an MCP stdio server, so `-i` is required. Secret
references of the form `{ "file": … }` need their files mounted as well; `{ "env": … }` works
with `-e`.

## Configuration

Configuration is a single JSON file. There is no environment-only mode.

Lookup order:

1. `MAILGLASS_CONFIG`, explicit path
2. `~/.config/mailglass/config.json`
3. `~/.mailglass/config.json`

### Schema

```jsonc
{
  "defaultAccount": "work",

  "storage": { "dir": "~/.mailglass", "cache": true, "maxEmlBytes": 26214400 },
  "session": { "ttlSeconds": 60 },
  "proxy":   { "url": "socks5://proxy.internal:1080" },

  "providers": {
    "gmail": { "readOnly": true }
  },

  "accounts": [
    {
      "id": "work",
      "provider": "gmail",
      "label": "Work Gmail",
      "email": "me@company.com",
      "enabled": true,
      "auth": {
        "username": "me@company.com",
        "password": { "file": "~/.secrets/work_gmail_app_password" }
      }
    }
  ]
}
```

Every field is validated, and **unknown keys are rejected**: a typo like `"provder"` fails loudly
instead of being ignored.

### Secrets are references, never literals

```jsonc
"password": { "env": "WORK_GMAIL_APP_PASSWORD" }   // read from the environment
"password": { "file": "~/.secrets/work_password" } // read from a file (chmod 600)
```

Because the config holds no secrets, it can be shared or committed safely. App passwords are
whitespace-stripped: Google displays them as `abcd efgh ijkl mnop`, and the spaces are cosmetic.

### `email` versus `auth.username`

They are deliberately separate. `email` is identity (display, logging, masking); `auth.username` is
what actually authenticates. They usually match for Gmail, but not for every provider or alias.
`username` defaults to `email` when omitted.

### The `readOnly` gate

Resolved per account: `account.readOnly ?? provider.readOnly ?? true`.

When true, only read capabilities are advertised and no write tool can be registered. Defaulting to
true means a config that says nothing can never send or delete mail.

### Multiple accounts

Add more entries to `accounts` and set `defaultAccount`. Tools gain an optional `account` argument
naming which mailbox to use; with a single account it is a no-op and the description says so.

### Wire it into opencode

```jsonc
{
  "mcp": {
    "servers": {
      "mailglass": {
        "type": "local",
        "command": ["mailglass"],
        "environment": {
          "MAILGLASS_CONFIG": "/Users/you/.config/mailglass/config.json"
        }
      }
    }
  }
}
```

Only the config **path** is passed, so no credential ever appears in a process environment.

---

## Local storage

```
$storage.dir/                        # default ~/.mailglass
└── <account-id>/                    # e.g. work
    ├── messages/<id>.eml            # raw RFC 822 message, the storage primitive
    ├── attachments/<id>/0-invoice.pdf
    ├── cache/messages.sqlite        # index of messages actually observed
    └── tmp/                         # in-flight writes only
```

| Setting | Default | Meaning |
|---|---|---|
| `storage.dir` | `~/.mailglass` | Base directory |
| `storage.cache` | `true` | `false` performs **no disk writes at all** |
| `storage.maxEmlBytes` | 26214400 | Skip caching larger messages; `0` = unlimited |

- Directories are created lazily and are `0700`; files are `0600`.
- Writes are atomic, so a crash cannot leave a half-written cache entry.
- A truncated message is never cached: a partial `.eml` is not a valid file.
- **Cached mail is plaintext on disk.** `0700` keeps other *users* out; encryption is not
  implemented.
- Purge anytime: `rm -rf ~/.mailglass/<account-id>`. Cached `.eml` files open in any mail client.

---

## Network and performance

| Setting | Default | Meaning |
|---|---|---|
| `proxy.url` | none | Tunnel IMAP through `http://`, `https://` or `socks*://` |
| `session.ttlSeconds` | `60` | Keep an idle connection this long; `0` closes after every call |

If no proxy is configured, `HTTPS_PROXY` / `ALL_PROXY` and their lowercase forms are used.

Connection reuse matters: a provider may spend seconds authenticating each new session, so a reused
connection turns a multi-second call into a fraction of one. Idle sessions are closed by a timer
that never keeps the process alive.

---

## Search behaviour

`search_emails` builds one query and lets the provider evaluate it, so results match what the
provider's own search returns.

| Parameter | Matches |
|---|---|
| `from` | sender name, address, or domain |
| `subject` | words or a phrase from the subject line |
| `keyword` | free text across senders, recipients, subject, and body |
| `has_attachment` | messages with at least one attachment |
| `unread` | only unread messages; a filter, never a mutation |
| `after` / `before` | date range, `YYYY-MM-DD`; `before` is exclusive |
| `folder` | a canonical name or any label name |

All filters combine with **AND**. Provider-specific operators (`from:`, `label:`, `filename:`,
`larger:`, `OR`, …) pass through `keyword` unchanged.

Matching is word-oriented, not arbitrary substring: prefer whole words, addresses and domains over
mid-word fragments.

---

## Read-only enforcement

- mailboxes are opened read-only (`EXAMINE`, never `SELECT`)
- bodies are fetched with `BODY.PEEK`, never `BODY`, so messages are not marked read
- no `STORE`, `COPY`, `MOVE`, `APPEND`, or `EXPUNGE` is ever issued
- there is no SMTP connection at all
- the `readOnly` gate withholds write capabilities from registration

**An app password grants full IMAP access to the mailbox.** Treat it like a password, keep one per
client, and revoke it from your account settings when you stop using this tool.

---

## Diagnostics

```bash
mailglass --check                  # validate the default account
mailglass --check --account dev    # validate one named account
mailglass --check --all            # validate every enabled account
mailglass --version
mailglass --help
```

`--check` performs no writes and reports the failing stage:

| Exit | Meaning |
|---|---|
| `0` | Everything works |
| `1` | Configuration problem |
| `2` | Credentials rejected |
| `3` | Network or proxy problem |

Email addresses are masked throughout (`a***@gmail.com`). A rejected credential is never retried:
repeated failed logins risk throttling and cannot succeed; the failure is memoised, so later calls
fail instantly.

---

## Data handling

| Tier | Content | Where |
|---|---|---|
| Message content | bodies, headers, attachments | provider → your machine; cached under `storage.dir` when enabled |
| Credentials | app password | the environment variable or file your config references |
| Vendor data | none | none: no server, no logs, no telemetry |

---

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| `No configuration file found` | Create `~/.config/mailglass/config.json` or set `MAILGLASS_CONFIG` |
| `Invalid configuration in …` | The message names the JSON path and what was expected |
| `environment variable X is not set` | The secret reference points at a missing variable |
| `cannot read … Create it containing only the password` | Missing secret file |
| `auth rejected` (exit 2) | Stale or revoked password, spaces not stripped, IMAP disabled, **or a Workspace admin disabled app passwords** |
| `connectivity` (exit 3) | **VPN or proxy blocking IMAP ports 993/143.** Check `nc -vz imap.gmail.com 993`; configure `proxy.url` |
| `Unknown account "x"` | Use an id from `server_info` or the config |
| `No attachment at index N` | Call `list_attachments`; indices are per message and start at 0 |

---

## License

**Proprietary.** See [LICENSE](./LICENSE). The software is licensed, not sold: modification,
redistribution and competing use are not permitted.

MailGlass bundles third-party packages under their own licenses. All are permissive (MIT, ISC,
BSD-2/3-Clause, MIT-0); see [THIRD-PARTY-NOTICES.md](./THIRD-PARTY-NOTICES.md) for the full list.
