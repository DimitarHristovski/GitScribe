# Deployment Guide

## Production Deployment Issues

When deploying to production, the Vite proxy (which works in development) is not available. This causes CORS errors when trying to call OpenAI's API directly from the browser.

## Solution: Serverless Function Proxy

We've created a serverless function that proxies OpenAI API calls to avoid CORS issues.

### For Vercel Deployment

1. **The serverless function is already created** at `api/openai/chat/completions.ts`
2. **Deploy to Vercel:**
   ```bash
   npm install -g vercel
   vercel
   ```
3. The `vercel.json` configuration is already set up

### For Netlify Deployment

1. **Create `netlify/functions/openai-chat-completions.ts`:**
   ```typescript
   import { Handler } from '@netlify/functions';

   export const handler: Handler = async (event, context) => {
     if (event.httpMethod !== 'POST') {
       return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
     }

     const apiKey = event.headers['x-api-key'] || event.headers['authorization']?.replace('Bearer ', '');
     
     if (!apiKey) {
       return {
         statusCode: 401,
         body: JSON.stringify({ error: { message: 'API key missing' } }),
       };
     }

     try {
       const response = await fetch('https://api.openai.com/v1/chat/completions', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${apiKey}`,
         },
         body: event.body,
       });

       const data = await response.json();
       return {
         statusCode: response.status,
         headers: {
           'Content-Type': 'application/json',
           'Access-Control-Allow-Origin': '*',
         },
         body: JSON.stringify(data),
       };
     } catch (error: any) {
       return {
         statusCode: 500,
         body: JSON.stringify({ error: { message: error.message } }),
       };
     }
   };
   ```

2. **Create `netlify.toml`:**
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"

   [[redirects]]
     from = "/api/openai/*"
     to = "/.netlify/functions/openai-chat-completions"
     status = 200
   ```

### For Other Platforms

You'll need to create a serverless function or API endpoint that:
1. Accepts POST requests to `/api/openai/chat/completions`
2. Reads the `x-api-key` header
3. Forwards the request to `https://api.openai.com/v1/chat/completions` with the API key
4. Returns the response with CORS headers

### Alternative: Use a CORS Proxy Service

If you can't deploy serverless functions, you can use a CORS proxy service (not recommended for production due to security concerns):

Update `src/lib/langchain-service.ts` line 88:
```typescript
const proxyUrl = isDev ? '/api/openai/chat/completions' : 'https://your-cors-proxy.com/https://api.openai.com/v1/chat/completions';
```

## Testing Production Build Locally

1. Build the app:
   ```bash
   npm run build
   ```

2. Preview the production build:
   ```bash
   npm run preview
   ```

3. Test that API calls work (check browser console for errors)

## Environment Variables

Make sure to set these in your hosting platform:
- `VITE_OPENAI_API_KEY` (optional - users can set it in the UI)
- `VITE_GITHUB_TOKEN` (optional - users can set it in the UI)

Note: Vite environment variables must be prefixed with `VITE_` to be accessible in the browser.

