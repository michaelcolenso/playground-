# OpenGrab

Favicon & Open Graph image API. Fetch favicons, OG images, and site metadata from any URL with a single request.

## Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/v1/favicon?url=<url>` | Fetch a site's favicon (supports resize + format conversion) |
| `GET /api/v1/og?url=<url>` | Get Open Graph metadata as JSON |
| `GET /api/v1/og/image?url=<url>` | Get OG image (auto-generates if site has none) |
| `GET /api/v1/meta?url=<url>` | Combined metadata + convenient image links |
| `GET /api/v1/generate?title=<title>` | Generate custom OG images on the fly |

## Quick Start

```bash
npm install
npm run build
npm start
```

Server runs on `http://localhost:3000`.

## Development

```bash
npm run dev    # watch mode
npm test       # run tests
npm run lint   # type check
```

## Docker

```bash
docker build -t opengrab .
docker run -p 3000:3000 opengrab
```

## Authentication

Pass your API key via `X-API-Key` header or `?api_key=` query parameter. Requests without a key get 20 req/day. Free tier gets 100 req/day.

## Architecture

- **Favicon engine**: Multi-strategy (HTML `<link>` tags, web manifest, `/favicon.ico` fallback) with automatic format conversion via sharp
- **OG extraction**: Parses `og:*` and `twitter:*` meta tags with cheerio
- **Image generation**: SVG-to-PNG pipeline via sharp — no headless browser needed
- **Caching**: In-memory LRU cache (swap for Redis in production)
- **Rate limiting**: Per-key daily counters with tier-based limits
