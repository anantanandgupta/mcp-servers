# GitHub Pro MCP

[![npm version](https://img.shields.io/npm/v/github-pro-mcp)](https://www.npmjs.com/package/github-pro-mcp)
[![Docker image](https://img.shields.io/docker/v/anantanandgupta/github-pro-mcp)](https://hub.docker.com/r/anantanandgupta/github-pro-mcp)

An MCP (Model Context Protocol) server providing comprehensive GitHub API access via hybrid REST + GraphQL — **34 tools across 8 domains**.

## Features

- **34 Tools** — issues, pull requests, repositories, projects v2, labels, organizations, file operations, server info
- **Hybrid API** — REST for CRUD/search, GraphQL for cursor pagination and composite queries
- **Resilient by Default** — automatic retry with exponential backoff + jitter, circuit breaker for API outages, proactive rate limit management
- **Structured Logging** — multi-level (error/warn/info/debug) stderr output
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
export GITHUB_PERSONAL_ACCESS_TOKEN=ght
_your_token_here
github-pro-mcp
```

Or with Docker:

```bash
docker run -i --rm -e GITHUB_PERSONAL_ACCESS_TOKEN=ghp_your_token_here anantanandgupta/github-pro-mcp
```

## Configuration

### Required

| Variable | Description |
|---------|-----------|
| `GITHUB_PERSONAL_ACCESS_TOKEN` | GitHub PAT with appropriate scopes |

### Optional

| Variable | Default | Description |
|---------|--------|-----------|
| `GITHUB_HOST` | — | For GHES: `https://{hostname}/api/v3` 
| `GITHUB_OWNER` | — | Pin server to a single owner (rejects mismatched calls) |
| `GITHUB_REPO` | — | Pin server to a single repository (rejects mismatched calls) |
| `GITHUB_RETRY_MAX_ATTEMPTS` | `3` | Max retries for transient errors |
| `GITHUB_RETRY_BACKOFF_MS` | `1000` | Initial retry backoff (ms) |
| `GITHUB_CIRCUIT_BREAKER_THRESHOLD` | `5` | Failures before circuit opens |
| `GITHUB_CIRCUIT_BREAKER_RESET_MS` | `30000` | Circuit recovery timeout (ms) |
| `GITHUB_RETRY_BACKOFF_FACTOR` | `2` | Exponential backoff multiplier |
| `GITHUB_OWNER_TYPE_CACHE_MS` | `300000` | Cache TTL for owner type lookups (5 min) |
| `GITHUB_THROTTLE_ON_RATE_LIMIT` | `retry` | Primary rate limit strategy: `retry` or `queue` |
| `GITHUB_THROTTLE_ON_SECONDARY_RATE_LIMIT` | `retry` | Secondary rate limit strategy: `retry` or `queue` |
| `GITHUB_LOG_LEVEL` | `error` | Log level: `error`, `warn`, `info`, `debug` |

## Usage with opencode

Add to your `opencode.json`:

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

For Docker-based usage:

```json
{
  "mcp": {
    "github_pro": {
      "type": "local",
      "command": ["docker", "run", "-i", "--rm", "-e", "GITHUB_PERSONAL_ACCESS_TOKEN", "anantanandgupta/github-pro-mcp"],
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

## Tool Reference

| Domain | Tools | Count |
|-------|-------|------|
| **User & Repos** | `auth_get_current_login`, `file_get_content`, `profile_get`, `owner_list_repository`, `file_create_update`, `file_delete`, `code_search`, `repository_search` | 8 |
| **Issues** | `issue_read`, `issue_list`, `issue_search`, `issue_add_comment`, `sub_issue_write`, `issue_create`, `issue_close`, `issue_reopen`, `issue_update`, `issue_add_label`, `issue_remove_label` | 11 |
| **Issue Fields** | `owner_list_issue_field`, `issue_get_field_value`, `issue_set_field_value` | 3 |
| **Pull Requests** | `pull_request_read`, `pull_request_create`, `pull_request_merge` | 3 |
| **Organizations** | `organization_search`, `owner_list_issue_type`, `owner_list_organization` | 3 |
| **Projects v2** | `owner_list_project`, `projects_get`, `projects_write` | 3 |
| **Labels** | `label_list`, `label_write` | 2 |
| **Server Info** | `server_info` | 1 |
| **Total** | | **34** |

## Frequently Asked Questions

| Error | Likely Cause |
|------|----------|
| `401` | Token expired or invalid |
| `403` | Missing OAuth scopes or SSO |
| `404` | Resource doesn't exist or no access |
| `429` | Rate limited — wait and retry |
| Circuit breaker open | GitHub API returning repeated errors — auto-recovers in 30s |

## Releasing

This repository hosts GitHub releases containing the built npm package (`.tgz`).
See the [Releases](https://github.com/anantanandgupta/mcp-servers/releases) page for
downloadable artifacts of each version.

## Contributing
> [[important]
> This repository is for **releases, issues, and discussions only**.	> The source code is maintained in a private repository.

- **Report bugs** — [Open an issue](https://github.com/anantanandgupta/mcp-servers/issues/new?template=bug_report.yml)
- **Feature requests** — [Open an issue](https://github.com/anantanandgupta/mcp-servers/issues/new?template=feature_request.yml)
- **Ask questions** — [Start a discussion](https://github.com/anantanandgupta/mcp-servers/discussions)

## License

ISC