# GitHub Pro MCP

[![npm version](https://img.shields.io/npm/v/github-pro-mcp)](https://www.npmjs.com/package/github-pro-mcp)
[![Docker image](https://img.shields.io/docker/v/anantanandgupta/github-pro-mcp)](https://hub.docker.com/r/anantanandgupta/github-pro-mcp)

An MCP server that gives your agent a complete GitHub toolkit: **34 tools** for issues, pull requests, files, projects, labels and organizations.

**Documentation and token generator:** https://mcp.anantanandgupta.net/

## Features

- **34 Tools** — issues, pull requests, repositories, projects v2, labels, organizations, file operations, server info
- **Complete GitHub coverage** — issues, pull requests, files, projects, labels and organizations, without writing pagination or composite queries by hand
- **Keeps working** — when GitHub is slow or rate-limited
- **Clear errors** — when a call fails, so the agent can recover or ask
- **Owner/Repo Pinning** — lock the server to a specific owner or repository as a safety guardrail

## Installation

### npm

```bash
# Install globally
npm install -g github-pro-mcp

# Or run directly without installing
npx github-pro-mcp
```

### Docker

Multi-arch images for `linux/amd64` and `linux/arm64`:

```bash
docker pull anantanandgupta/github-pro-mcp
```

## Quick Start

Set your GitHub token and run:

```bash
export GITHUB_PERSONAL_ACCESS_TOKEN=ghp_your_token_here
github-pro-mcp
```

Or with Docker:

```bash
docker run -i --rm \
  -e GITHUB_PERSONAL_ACCESS_TOKEN=ghp_your_token_here \
  anantanandgupta/github-pro-mcp
```

## Configuration

### Required

| Variable | Description |
|----------|-------------|
| `GITHUB_PERSONAL_ACCESS_TOKEN` | GitHub PAT with appropriate scopes |

### Optional

| Variable | Description |
|----------|-------------|
| `GITHUB_HOST` | For GitHub Enterprise Server: `https://{hostname}/api/v3` |
| `GITHUB_OWNER` | Pin the server to a single owner and reject mismatched calls |
| `GITHUB_REPO` | Pin the server to a single repository |

The defaults handle retries, rate limits and logging. You do not need to tune them for normal use.

## Usage with opencode

Add to your opencode config (v2 nests servers under `mcp.servers`):

```jsonc
{
  "mcp": {
    "servers": {
      "github_pro": {
        "type": "local",
        "command": ["npx", "-y", "github-pro-mcp"],
        "environment": {
          "GITHUB_PERSONAL_ACCESS_TOKEN": "{env:GITHUB_TOKEN}"
        }
      }
    }
  }
}
```

For Docker-based usage:

```jsonc
{
  "mcp": {
    "servers": {
      "github_pro": {
        "type": "local",
        "command": ["docker", "run", "-i", "--rm", "-e", "GITHUB_PERSONAL_ACCESS_TOKEN", "anantanandgupta/github-pro-mcp"],
        "environment": {
          "GITHUB_PERSONAL_ACCESS_TOKEN": "{env:GITHUB_TOKEN}"
        }
      }
    }
  }
}
```

## Tool Reference

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

## FAQ / Troubleshooting

| Error | Likely Cause |
|-------|-------------|
| `401` | Token expired or invalid |
| `403` | Missing OAuth scopes or SSO |
| `404` | Resource doesn't exist or no access |
| `429` | Rate limited — wait and retry |

## License

Proprietary. Free to install and use, including for internal business purposes.
Modification, redistribution, sublicensing and reverse engineering are not
permitted. See [LICENSE](LICENSE) for the full terms.
