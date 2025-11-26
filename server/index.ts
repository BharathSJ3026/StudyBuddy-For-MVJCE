import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
const PORT = 3001;

const SERP_API_KEY = process.env.SERP_API_KEY || '';

app.use(cors());
app.use(express.json());

// Google Scholar search endpoint
app.get('/api/scholar/search', async (req, res) => {
  try {
    const { q, start = '0' } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const params = new URLSearchParams({
      api_key: SERP_API_KEY,
      engine: 'google_scholar',
      q: q as string,
      hl: 'en',
      start: start as string,
      num: '10'
    });

    const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('SerpAPI error:', errorText);
      return res.status(response.status).json({ error: 'SerpAPI request failed', details: errorText });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error', message: (error as Error).message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Scholar API server running on http://localhost:${PORT}`);
  console.log(`📚 Search endpoint: http://localhost:${PORT}/api/scholar/search?q=your+query`);
});
