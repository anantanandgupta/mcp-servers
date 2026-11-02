# MCP Servers

Production-ready MCP servers for AI agents, built by [Anant Anand Gupta](https://github.com/anantanandgupta).

**Documentation, guides and the token generator:** https://mcp.anantanandgupta.net/

## Servers

| Server | What it does | Install |
| --- | --- | --- |
| [GitHub Pro MCP](./github-pro-mcp/README.md) | 34 GitHub tools across 8 domains. Hybrid REST and GraphQL, with retries, rate-limit handling and owner pinning. | `npm install -g github-pro-mcp` |

Each server ships as its own npm package and Docker image. The site is the guided path; the README in each server folder is the reference.

## Website

The site is published with GitHub Pages from the [`docs/`](./docs) folder:

- https://mcp.anantanandgupta.net/

## Releases

Releases are per server, because each server ships on its own schedule.

- **GitHub Pro MCP:** `github-pro-mcp-vX.Y.Z` going forward. The earlier `v0.0.1` and `v0.0.2` releases are GitHub Pro MCP releases.

## License

Each server carries its own license. See the server folder for details.
