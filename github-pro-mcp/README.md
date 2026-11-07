# GitHub Pro MCP

[![npm version](https://img.shields.io/npm/v/github-pro-mcp)](https://www.npmjs.com/package/github-pro-mcp)
[![Docker image](https://img.shields.io/docker/v/anantanandgupta/github-pro-mcp)](https://hub.docker.com/r/anantanandgupta/github-pro-mcp)

GitHub Pro MCP gives Claude Code, Cursor, Copilot, opencode and any MCP host a
complete GitHub toolkit: **34 tools** for issues, pull requests, files, projects,
labels and organizations.

Read-only mode is the default. The server registers 19 read tools and keeps the
15 write tools out of the agent's context. Set
`GITHUB_MCP_ENABLE_WRITES=true` to load the full set.

It runs locally, connects to your host over stdio, and calls the GitHub API
directly with your own token. There is no intermediary service.

New to MCP? It is the open protocol that lets a host connect a model to tools:
https://modelcontextprotocol.io/

**Documentation, installation guides, permissions and token generator:**
https://mcp.anantanandgupta.net/

## What you can do

- **Triage issues** - read, search, comment, label, close, reopen and manage
  sub-issues.
- **Review pull requests** - read details, commits and reviews, create pull
  requests and merge them.
- **Work with files** - read, create, update and delete files, and search code
  across repositories.
- **Organize work** - set Priority, Effort and dates, and move items through
  Projects v2.
- **Find your way around** - list every repository an organization owns, and
  search organizations and code.

Ask in plain language. The agent chooses the tools, and the server handles the
API details.

## Why this server

- **34 tools across 8 domains.** Issues, pull requests, repositories, projects,
  labels, organizations, file operations and server info.
- **Read-only by default.** 19 tools, no write surface. Enable writes explicitly.
- **Built for the common path.** The daily loop is small: read an issue, review a pull
  request, change a file, update a project field. The long tail stays out of the
  agent's context until you need it.
- **Organization-aware.** `owner_list_repository` lists every repository in an
  organization.
- **Built for real API conditions.** Retries with backoff, rate-limit handling
  and a circuit breaker for repeated failures. The defaults work; there is
  nothing to tune.
- **Guardrails.** Pin the server to one owner or repository with
  `GITHUB_OWNER` / `GITHUB_REPO`, and mismatched calls are rejected.
- **Guided token setup.** The generator builds a pre-filled fine-grained token
  with a read-only or read-write preset.
- **Any MCP host.** A standard stdio server. Works with opencode, Claude
  Desktop, Cursor, VS Code and anything else that speaks MCP.
- **No runtime dependencies.** The npm package ships one bundled file, so
  installing it does not pull a dependency tree.
- **GitHub Enterprise Server.** Point `GITHUB_HOST` at your GHES API.

If your work is mostly Actions, security scanning, notifications, discussions,
gists, governance or Copilot, use the official GitHub MCP server. GitHub Pro MCP
is built for the daily issue, pull request, file and project loop.

## Installation

Requires Node.js 22 or newer for the npm package. The Docker image includes
Node.js.

### npm

```bash
# Install globally
npm install -g github-pro-mcp

# Or run directly without installing
npx -y github-pro-mcp
```

### Docker

Multi-arch images are published for `linux/amd64` and `linux/arm64`.

```bash
docker pull anantanandgupta/github-pro-mcp
```

## Quick start

1. Create a token with the generator:
   https://mcp.anantanandgupta.net/github-pro-mcp/token/
2. Install the server with npm or Docker.
3. Add it to your MCP host and restart the host.
4. Verify with the `auth_get_current_login` tool.

By default the server is read-only and registers 19 tools. To enable issue,
pull request, file, label and project writes, set
`GITHUB_MCP_ENABLE_WRITES=true` in the host environment.

### Create a token

Use a fine-grained personal access token. The generator builds a pre-filled
GitHub page with the right checkboxes:

- **Read-only preset:** Metadata read, Contents read, Issues read, Pull requests
  read, Issue fields read, Issue types read, Projects read.
- **Read-write preset:** Metadata read, Contents write, Issues write, Pull
  requests write, Issue fields write, Issue types read, Projects write.

Merging a pull request also requires Contents write. If the repository belongs
to an organization that requires approval, request it while creating the token.

The full per-tool permission table is at
https://mcp.anantanandgupta.net/github-pro-mcp/permissions/

The read-only preset pairs with the default read-only mode. The read-write
preset requires `GITHUB_MCP_ENABLE_WRITES=true` in the host environment.

### Connect opencode

Add to your opencode config (v2 nests servers under `mcp.servers`):

```jsonc
{
  "mcp": {
    "servers": {
      "github_pro": {
        "type": "local",
        "command": ["npx", "-y", "github-pro-mcp"],
        "environment": {
          "GITHUB_PERSONAL_ACCESS_TOKEN": "{env:GITHUB_TOKEN}",
          "GITHUB_MCP_ENABLE_WRITES": "true"
        }
      }
    }
  }
}
```

`{env:GITHUB_TOKEN}` reads that variable from the environment opencode starts
in. Use a literal token instead if you prefer. Remove
`GITHUB_MCP_ENABLE_WRITES` to stay read-only.

### Connect Claude Desktop

Edit `claude_desktop_config.json` and restart Claude Desktop:

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "github-pro-mcp"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "github_pat_...",
        "GITHUB_MCP_ENABLE_WRITES": "true"
      }
    }
  }
}
```

### Connect Cursor or VS Code

Both support stdio MCP servers. The configuration is the same command and token
as above; only the file location differs. Exact snippets are in the
installation guide:

https://mcp.anantanandgupta.net/github-pro-mcp/install/

### Use Docker with opencode

```jsonc
{
  "mcp": {
    "servers": {
      "github_pro": {
        "type": "local",
        "command": ["docker", "run", "-i", "--rm", "-e", "GITHUB_PERSONAL_ACCESS_TOKEN", "-e", "GITHUB_MCP_ENABLE_WRITES", "anantanandgupta/github-pro-mcp"],
        "environment": {
          "GITHUB_PERSONAL_ACCESS_TOKEN": "{env:GITHUB_TOKEN}",
          "GITHUB_MCP_ENABLE_WRITES": "true"
        }
      }
    }
  }
}
```

The same `docker run` command works as the server command in other hosts.

## Configuration

### Required

| Variable | Description |
|----------|-------------|
| `GITHUB_PERSONAL_ACCESS_TOKEN` | GitHub personal access token. Fine-grained is recommended. |

### Optional

| Variable | Description |
|----------|-------------|
| `GITHUB_HOST` | GitHub Enterprise Server API, for example `https://github.example.com/api/v3` |
| `GITHUB_OWNER` | Pin the server to a single owner and reject mismatched calls |
| `GITHUB_REPO` | Pin the server to a single repository and reject mismatched calls |
| `GITHUB_MCP_ENABLE_WRITES` | Set to `true`, `1`, `yes` or `on` to register the 15 write tools. Default `false` |

Retries, rate limiting and logging have sensible defaults. You do not need to
tune them for normal use.

## Tools

34 tools across 8 domains. Read-only mode registers 19 of them; the other 15
are write tools. Tool names appear in your host's tool list after the server
starts.

| Domain | Tools | Count |
|--------|-------|-------|
| **User & Repos** | `auth_get_current_login`, `file_get_content`, `profile_get`, `owner_list_repository`, `file_create_update`, `file_delete`, `code_search`, `repository_search` | 8 |
| **Issues** | `issue_read`, `issue_list`, `issue_search`, `issue_add_comment`, `sub_issue_write`, `issue_create`, `issue_close`, `issue_reopen`, `issue_update`, `issue_add_label`, `issue_remove_label` | 11 |
| **Issue Fields** | `owner_list_issue_field`, `issue_get_field_value`, `issue_set_field_value` | 3 |
| **Pull Requests** | `pull_request_read`, `pull_request_create`, `pull_request_merge` | 3 |
| **Organizations** | `organization_search`, `owner_list_issue_type`, `owner_list_organization` | 3 |
| **Projects v2** | `owner_list_project`, `projects_get`, `projects_write` | 3 |
| **Labels** | `label_list`, `label_write` | 2 |
| **Server Info** | `server_info` | 1 |
| **Total** | | **34** |

Task-based examples and the prompts they respond to are at
https://mcp.anantanandgupta.net/github-pro-mcp/tools/

A measured comparison with the official GitHub MCP server is at
https://mcp.anantanandgupta.net/github-pro-mcp/compare/

## Troubleshooting

| Symptom | Likely cause |
|---------|--------------|
| `401` | Token expired, revoked or mistyped |
| `403` | Missing permission, organization approval, or SSO not authorized |
| `404` | The resource does not exist, or the token cannot see it |
| `429` | Rate limited. The server retries; wait if it persists |
| No tools appear in the host | The host was not restarted, or the server failed to start |
| Server exits immediately | `GITHUB_PERSONAL_ACCESS_TOKEN` is not set in the host's environment |
| Write tool not in the list | `GITHUB_MCP_ENABLE_WRITES` is not set to `true` |

## Support

- **Documentation:** https://mcp.anantanandgupta.net/
- **Issues and feature requests:** https://github.com/anantanandgupta/mcp-servers/issues
- **npm:** https://www.npmjs.com/package/github-pro-mcp
- **Docker:** https://hub.docker.com/r/anantanandgupta/github-pro-mcp

## License

Proprietary. Free to install and use, including for internal business purposes.
Modification, redistribution, sublicensing and reverse engineering are not
permitted. See the
[license](https://github.com/anantanandgupta/mcp-servers/blob/main/github-pro-mcp/LICENSE)
for the full terms.
