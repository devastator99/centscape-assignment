# Centscape Unified Wishlist Client App

A React Native + Expo TypeScript app with Node.js backend for creating and managing product wishlists with URL preview functionality.

## Features

### React Native App
- **Deep Linking**: `centscape://add?url=` opens Add flow with pre-filled URL
- **Add Flow**: URL input → preview fetch → add to wishlist
- **Wishlist Screen**: Virtualized list showing title, image, price, domain, timestamp
- **Persistence**: SQLite with schema migration (v1→v2 adds `normalizedUrl`)
- **Deduplication**: URL normalization (removes UTM params, fragments, lowercase host)
- **Resilience**: Skeleton loading, error retry, fallback images
- **Accessibility**: Comprehensive accessibility labels

### Node.js Server
- **Preview Endpoint**: `POST /preview` with URL extraction
- **Security**: SSRF protection, rate limiting (10 req/min/IP), timeout ≤5s
- **Extraction**: Open Graph → Twitter Card → oEmbed → fallback parsing
- **Robustness**: Max 3 redirects, 512KB size limit, content-type validation

## Setup & Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator or Android Emulator

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd centscape-assignment
cd server
npm install
cd ..
cd app
npm install
```

2. **Start the server:**
```bash
cd server
npm run dev
```

3. **Start the React Native app:**
```bash
cd app
npm run start
```

4. **Run tests:**
```bash
# Root verification (runs all checks)
npm run verify

# Server tests only
cd server
npm test

# App type checking
cd app
npm run typecheck
```

## Project Structure

```
/
├── app/                    # React Native Expo app
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── screens/        # App screens (Wishlist, Add)
│   │   ├── utils/          # Utilities (URL normalization)
│   │   ├── db.ts          # SQLite database layer
│   │   └── types.ts       # TypeScript types
│   ├── app.json           # Expo configuration
│   └── package.json
├── server/                 # Node.js Fastify server
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Server utilities (fetch, parse, IP)
│   │   ├── app.ts         # Fastify app factory
│   │   └── index.ts       # Server entry point
│   ├── tests/             # Test files and fixtures
│   └── package.json
├── schemas/               # JSON Schema definitions
└── README.md
```

## API Documentation

### POST /preview

**Request:**
```json
{
  "url": "https://example.com/product",
  "raw_html": "<html>...</html>"  // Optional
}
```

**Response:**
```json
{
  "title": "Product Name",
  "image": "https://example.com/image.jpg",
  "price": "$29.99",
  "currency": "$",
  "siteName": "Example Store",
  "sourceUrl": "https://example.com/product"
}
```

**Error Response:**
```json
{
  "error": "Invalid URL"
}
```

## Deep Linking

The app supports deep linking with the `centscape://` scheme:

- `centscape://add?url=https://example.com/product` - Opens Add screen with URL pre-filled
- `centscape://` - Opens main Wishlist screen

## Engineering Tradeoffs & Risks

### Architecture Decisions

1. **Fastify over Express**: Chosen for better TypeScript support, built-in validation, and performance
2. **SQLite over Remote DB**: Simpler setup, offline capability, but limits multi-device sync
3. **Expo over React Native CLI**: Faster development, easier deployment, but some native limitations
4. **Client-side normalization**: Better UX but could be inconsistent vs server-side normalization

### Security Considerations

1. **SSRF Protection**: Blocks private IPs but DNS rebinding attacks still possible
2. **Rate Limiting**: Per-IP limiting can be bypassed with proxies
3. **Content Size**: 512KB limit prevents DoS but may block legitimate large pages
4. **User-Agent**: Static UA may be blocked by some sites

### Performance Tradeoffs

1. **5s Timeout**: Balances UX vs completeness - some slow sites may fail
2. **3 Redirect Limit**: Prevents redirect loops but may miss final destinations
3. **FlatList Virtualization**: Good for large lists but estimated heights may cause scrolling issues
4. **Image Fallbacks**: Always show something but may display irrelevant placeholders

### Scalability Risks

1. **SQLite**: Single-user limitation, no cloud sync
2. **In-memory Rate Limiting**: Resets on server restart, doesn't scale horizontally
3. **No Caching**: Every preview request hits target server
4. **No Background Processing**: All operations block user interaction

### Data Privacy

1. **URL Logging**: Server may log requested URLs in access logs
2. **Local Storage**: All data stored locally on device
3. **No Analytics**: No usage tracking implemented
