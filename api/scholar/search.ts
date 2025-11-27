export default async function handler(request: any, response: any) {
  // Handle CORS
  response.setHeader('Access-Control-Allow-Credentials', true);
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  const apiKey = process.env.SERP_API_KEY;

  if (!apiKey) {
    return response.status(500).json({ error: 'Server configuration error: API key missing' });
  }

  const { q, start = '0' } = request.query;

  if (!q) {
    return response.status(400).json({ error: 'Query parameter "q" is required' });
  }

  try {
    const params = new URLSearchParams({
      api_key: apiKey,
      engine: 'google_scholar',
      q: q as string,
      hl: 'en',
      start: start as string,
      num: '10'
    });

    const serpUrl = `https://serpapi.com/search.json?${params.toString()}`;

    const apiRes = await fetch(serpUrl);
    
    if (!apiRes.ok) {
        const errorText = await apiRes.text();
        return response.status(apiRes.status).json({ error: 'SerpAPI request failed', details: errorText });
    }

    const data = await apiRes.json();
    return response.status(200).json(data);
  } catch (error) {
    console.error('SerpAPI Error:', error);
    return response.status(500).json({ error: 'Failed to fetch data from SerpAPI' });
  }
}
