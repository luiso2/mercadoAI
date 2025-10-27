# Market Backend

Backend service for shopping list management with Google OAuth authentication and JWT authorization.

## Features

- Google OAuth 2.0 (ID Token verification + Authorization Code with PKCE)
- JWT-based API authentication
- Shopping list management with MongoDB
- Item suggestions based on list contents
- Mock store price search provider
- OpenAPI documentation
- Ready for Railway deployment

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
NODE_ENV=production
PORT=8080
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/market?retryWrites=true&w=majority
JWT_SECRET=your_secret_min_32_characters_long
JWT_EXPIRES_IN=7d
SESSION_SECRET=your_session_secret_min_32_chars
BASE_URL=https://your-app.up.railway.app
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://your-app.up.railway.app/auth/google/callback
PROVIDERS=mock
DEFAULT_CHAIN=Ralphs
```

## Google Cloud Console Setup

1. Go to https://console.cloud.google.com/apis/credentials
2. Create a new OAuth 2.0 Client ID
3. Application type: **Web application**
4. Authorized JavaScript origins:
   - `https://your-app.up.railway.app`
   - `http://localhost:8080` (for local development)
5. Authorized redirect URIs:
   - `https://your-app.up.railway.app/auth/google/callback`
   - `http://localhost:8080/auth/google/callback` (for local development)
6. Copy the **Client ID** and **Client Secret** to your environment variables

## Railway Deployment

1. Create a new project on Railway
2. Add a MongoDB database (or use MongoDB Atlas)
3. Set all environment variables in Railway dashboard
4. Connect your GitHub repository
5. Railway will auto-detect the Dockerfile and deploy
6. Check health: `https://your-app.up.railway.app/health`

## ChatGPT Actions Setup

### Option 1: OAuth 2.0 (Recommended for ChatGPT)

1. Import OpenAPI spec:
   - URL: `https://your-app.up.railway.app/openapi`

2. Configure Authentication:
   - Type: **OAuth 2.0**
   - Authorization URL: `https://your-app.up.railway.app/oauth/authorize`
   - Token URL: `https://your-app.up.railway.app/oauth/token`
   - Scope: `openid email profile`
   - Client ID: `chatgpt` (any string)
   - Client Secret: `unused` (not validated)
   - PKCE: **Enabled** (automatically handled)

3. Test the action - it will redirect to Google login

### Option 2: API Key (Bearer Token)

1. First, get a JWT token via ID token verification:
   ```bash
   # Get Google ID token from your frontend/app
   curl -X POST https://your-app.up.railway.app/auth/google/verify \
     -H "Content-Type: application/json" \
     -d '{"idToken": "YOUR_GOOGLE_ID_TOKEN"}'
   ```

2. Configure in ChatGPT Actions:
   - Type: **API Key**
   - Header: `Authorization`
   - Prefix: `Bearer`
   - Value: `<paste JWT from step 1>`

## API Usage Examples

### 1. Create a shopping list

```bash
curl -X POST https://your-app.up.railway.app/lists \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Weekly Groceries"}'
```

### 2. Add items to list

```bash
curl -X POST https://your-app.up.railway.app/lists/LIST_ID/items \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "milk", "qty": 2, "unit": "gallon"}'
```

### 3. Mark item as bought

```bash
curl -X PATCH https://your-app.up.railway.app/lists/LIST_ID/items/ITEM_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "bought"}'
```

### 4. Get pending items

```bash
curl https://your-app.up.railway.app/lists/LIST_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Filter `items` array where `status === "pending"` on client side.

### 5. Get suggestions

```bash
curl https://your-app.up.railway.app/lists/LIST_ID/suggest \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6. Search store prices (mock)

```bash
curl "https://your-app.up.railway.app/stores/search?q=milk&zip=90210" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Local Development

```bash
# Install dependencies
corepack enable
pnpm install

# Run in development mode
pnpm dev

# Build for production
pnpm build

# Run production build
pnpm start
```

## Architecture Notes

- **OAuth grants and session state** are stored in-memory. For production with multiple instances, use Redis.
- **Mock provider** returns predictable fake prices for testing. Replace with real API integrations as needed.
- **JWT expiration** is configurable via `JWT_EXPIRES_IN` (default: 7 days).
- **PKCE validation** uses SHA-256 hashing of `code_verifier` compared against `code_challenge`.

## Security

- All API routes (except `/health`, `/auth/*`, `/oauth/*`) require Bearer JWT authentication
- Google ID tokens are verified using `google-auth-library`
- JWTs are signed with HS256 algorithm
- CORS enabled for all origins (configure based on your needs)
- Helmet.js for security headers
- Session cookies are HTTP-only and secure in production

## Testing

Test the complete flow:

1. Get JWT via Google ID token or OAuth flow
2. Create a list
3. Add items (milk, pasta, bread)
4. Get suggestions (should suggest cheese, salsa, butter)
5. Mark milk as "bought"
6. Fetch list and verify milk.status === "bought"
7. Search for prices using mock provider

## License

MIT
