/**
 * Vercel Serverless Function for OpenAI API Proxy
 * This handles OpenAI API calls in production to avoid CORS issues
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key, Authorization');
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get API key from request header
    const apiKey = req.headers['x-api-key'] as string || 
                   (req.headers['authorization'] as string)?.replace('Bearer ', '');
    
    if (!apiKey) {
      return res.status(401).json({
        error: { message: 'OpenAI API key is missing. Please set your API key in Settings.' }
      });
    }

    // Forward request to OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(req.body),
    });

    // Get response data
    const data = await response.json();

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key, Authorization');

    // Return response with same status code
    return res.status(response.status).json(data);
  } catch (error: any) {
    console.error('[API Proxy] Error:', error);
    return res.status(500).json({
      error: { message: error.message || 'Internal server error' }
    });
  }
}

