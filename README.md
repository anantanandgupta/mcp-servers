# GitHub Pro MCP

[![npm version](https://img.shields.io/npm/v/github-pro-mcp)](https://www.npmjs.com/package/github-pro-mcp)
[![Docker image](https://img.shields.io/docker/v/anantanandgupta/github-pro-mcp)](https://hub.docker.com/r/anantanandgupta/github-pro-mcp)

An MCP (Model Context Protocol) server providing comprehensive GitHub API access via hybrid REST + GraphQL — **32 tools across 7 domains**.

## Installation

### npm

```bash
npm install -g github-pro-mcp
# or run directly:
npx github-pro-mcp
```

### Docker

Multi-arch images for `linux/amd64` and `linux/arm64`:

```bash
docker pull anantanandgupta/github-pro-mcp
```

## Quick Start

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

| Variable | Required | Description |
|----------|----------|-------------|
| `GITHUB_PERSONAL_ACCESS_TOKEN` | Yes | GitHub PAT with appropriate scopes |
| `GITHUB_HOST` | No | For GHES: `https://{hostname}/api/v3` |
| `GITHUB_OWNER` | No | Pin server to a single owner |
| `GITHUB_REPO` | No | Pin server to a single repository |
| `GITHUB_LOG_LEVEL` | No | Log level: `error`, `warn`, `info`, `debug` |

## Tool Reference

| Domain | Tools | Count |
|--------|-------|-------|
| **User & Repos** | `auth_get_current_login`, `file_get_content`, `profile_get`, `owner_list_repository`, `file_create_update`, `code_search`, `repository_search` | 7 |
| **Issues** | `issue_read`, `issue_list`, `issue_search`, `issue_add_comment`, `sub_issue_write`, `issue_create`, `issue_close`, `issue_reopen`, `issue_update`, `issue_add_label`, `issue_remove_label` | 11 |
| **Issue Fields** | `owner_list_issue_field`, `issue_get_field_value`, `issue_set_field_value` | 3 |
| **Pull Requests** | `pull_request_read`, `pull_request_create`, `pull_request_merge` | 3 |
| **Organizations** | `organization_search`, `owner_list_issue_type`, `owner_list_organization` | 3 |
| **Projects v2** | `owner_list_project`, `projects_get`, `projects_write` | 3 |
| **Labels** | `label_list`, `label_write` | 2 |
| **Total** | | **32** |

## Usage with opencode

```json
{
  "mcp": {
    "github_pro": {
      "type": "local",
      "command": ["node", "path/to/github-pro-mcp/dist/index.js"],
      "environment": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "{env:GITHUB_TOKEN}"
      }
    }
  }
}
```

## Usage with Claude Desktop / Other MCP Hosts

Add to your MCP client config:

```json
{
  "mcpServers": {
    "github_pro": {
      "command": "npx",
      "args": ["github-pro-mcp"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token_here"
      }
    }
  }
}
```

## Frequently Asked Questions

| Error | Likely Cause |
|-------|-------------|
| `401` | Token expired or invalid |
| `403` | Missing OAuth scopes or SSO |
| `404` | Resource doesn't exist or no access |
| `429` | Rate limited — wait and retry |

## Releasing

This repository hosts GitHub releases containing the built npm package (`.tgz`).
See the [Releases](https://github.com/anantanandgupta/mcp-servers/releases) page for
downloadable artifacts of each version.

## Contributing

> [!IMPORTANT]
> This repository is for **releases, issues, and discussions only**.
> The source code is maintained in a private repository.

- **Report bugs** → [Open an issue](https://github.com/anantanandgupta/mcp-servers/issues/new?template=bug_report.yml)
- **Feature requests** → [Open an issue](https://github.com/anantanandgupta/mcp-servers/issues/new?template=feature_request.yml)
- **Ask questions** → [Start a discussion](https://github.com/anantanandgupta/mcp-servers/discussions)

## License

ISC
