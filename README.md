# MCP Servers

MCP servers that give your AI agent real tools, built by
[Anant Anand Gupta](https://github.com/anantanandgupta).

**Documentation, installation guides and token generator:**
https://mcp.anantanandgupta.net/

This repository is the documentation and release hub for the servers. They are
distributed as npm packages and Docker images.

## GitHub Pro MCP

Give Claude Code, Cursor, Copilot, opencode and any MCP host a complete GitHub
toolkit: 34 tools for issues, pull requests, files, projects, labels and
organizations.

- Triage issues, comment, label, close, reopen and manage sub-issues.
- Review pull requests, inspect commits, create pull requests and merge them.
- Read, create, update and delete files, and search code across repositories.
- Set Priority and Effort, and move items through Projects v2.
- List every repository an organization owns, and search organizations and code.

Install it globally:

```bash
npm install -g github-pro-mcp
```

Or run it without installing:

```bash
npx -y github-pro-mcp
```

Or use Docker:

```bash
docker run -i --rm \
  -e GITHUB_PERSONAL_ACCESS_TOKEN=github_pat_... \
  anantanandgupta/github-pro-mcp
```

For host configuration, token permissions and the full tool list, see the
[GitHub Pro MCP guide](./github-pro-mcp/README.md) and the
[documentation](https://mcp.anantanandgupta.net/github-pro-mcp/).

## MailGlass Email MCP

Give your agent read-only access to Gmail or any IMAP mailbox: 8 tools for
searching, reading, following threads and downloading attachments, with no send,
move or delete capability at all.

- Search with the provider's own query language, and count without fetching.
- Read one message or a whole thread, oldest first.
- List and download attachments, or return an image inline.
- Ask for a per-account capability map before calling a tool.

Install it globally:

```bash
npm install -g mailglass-email-mcp
```

Or run it without installing:

```bash
npx -y mailglass-email-mcp
```

Or use Docker:

```bash
docker run -i --rm \
  -v "$PWD/config.json:/cfg/config.json:ro" \
  -e MAILGLASS_CONFIG=/cfg/config.json \
  anantanandgupta/mailglass-email-mcp
```

For the Gmail app password setup, configuration schema and the full tool list,
see the [MailGlass guide](./mailglass-email-mcp/README.md) and the
[documentation](https://mcp.anantanandgupta.net/mailglass-email-mcp/).

## GitHub Pro quick start

1. Create a fine-grained token with the generator:
   https://mcp.anantanandgupta.net/github-pro-mcp/token/
2. Install the server with npm or Docker.
3. Add it to your MCP host and restart the host.
4. Verify with the `auth_get_current_login` tool.

The server runs on your machine and calls GitHub directly with your token.

## Links

- **Documentation:** https://mcp.anantanandgupta.net/
- **GitHub Pro MCP guide:** [github-pro-mcp/README.md](./github-pro-mcp/README.md)
- **MailGlass guide:** [mailglass-email-mcp/README.md](./mailglass-email-mcp/README.md)
- **npm:** https://www.npmjs.com/package/github-pro-mcp and https://www.npmjs.com/package/mailglass-email-mcp
- **Docker:** https://hub.docker.com/r/anantanandgupta/github-pro-mcp and https://hub.docker.com/r/anantanandgupta/mailglass-email-mcp
- **Issues:** https://github.com/anantanandgupta/mcp-servers/issues

## More servers

More MCP servers are on the way. Follow the documentation site or this
repository.

## License

Proprietary. Free to install and use. See the
[GitHub Pro MCP license](./github-pro-mcp/LICENSE).
