import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const FACE_PROVIDER_URL = 'https://thispersondoesnotexist.com/random-person.jpeg';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Cache-Control': 'no-store'
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json'
      }
    });
  }

  try {
    const upstreamUrl = `${FACE_PROVIDER_URL}?t=${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
    const upstreamResponse = await fetch(upstreamUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'gendir-face-proxy/1.0'
      }
    });

    if (!upstreamResponse.ok) {
      return new Response(JSON.stringify({ error: 'Upstream provider error' }), {
        status: 502,
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'application/json'
        }
      });
    }

    const imageBuffer = await upstreamResponse.arrayBuffer();
    const contentType = upstreamResponse.headers.get('content-type') || 'image/jpeg';

    return new Response(imageBuffer, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': contentType
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected proxy error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json'
      }
    });
  }
});
