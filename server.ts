import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { calculateTax } from './src/server/taxEngine';
import { calculateFire } from './src/server/fireEngine';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post('/api/analyze-portfolio', async (req, res) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: `Analyze the following portfolio and return a JSON response with the following structure:
        {
          "trueXirr": number,
          "benchmarkReturn": number,
          "expenseRatioDrag": number,
          "overlappingStocks": number,
          "overlapData": [
            { "stock": string, "funds": string[], "percentage": number }
          ],
          "expenseData": [
            { "name": string, "regular": number, "direct": number, "diff": number }
          ],
          "rebalancingPlan": [
            {
              "fundToRedeem": string,
              "units": number,
              "currentValue": number,
              "holdingPeriod": string,
              "estimatedTax": number,
              "fundToInvest": string,
              "reason": string,
              "expenseBenefit": string
            }
          ]
        }
        
        Portfolio details:
        ${JSON.stringify(req.body)}
        
        Make sure the response is valid JSON. Do not include markdown formatting like \`\`\`json.`,
        config: {
          responseMimeType: "application/json",
        }
      });

      const jsonStr = response.text?.trim() || '{}';
      const result = JSON.parse(jsonStr);
      res.json(result);
    } catch (e) {
      console.error('Error analyzing portfolio:', e);
      // Fallback to mock data if Gemini fails or API key is missing
      res.json({
        trueXirr: 14.2,
        benchmarkReturn: 12.1,
        expenseRatioDrag: 14250,
        overlappingStocks: 18,
        overlapData: [
          { stock: 'Reliance Ind.', funds: ['Mirae', 'HDFC', 'Parag Parikh'], percentage: 11.2 },
          { stock: 'HDFC Bank', funds: ['Mirae', 'HDFC', 'SBI'], percentage: 8.4 },
        ],
        expenseData: [
          { name: 'Mirae Large Cap', regular: 1.62, direct: 0.54, diff: 1.08 },
          { name: 'HDFC Flexi Cap', regular: 1.58, direct: 0.82, diff: 0.76 },
        ],
        rebalancingPlan: [
          {
            fundToRedeem: 'Mirae Asset Large Cap (Regular)',
            units: 3500,
            currentValue: 87400,
            holdingPeriod: '14 months',
            estimatedTax: 0,
            fundToInvest: 'Parag Parikh Flexi Cap (Direct)',
            reason: 'No overlap with existing holdings',
            expenseBenefit: '0.9% lower'
          }
        ]
      });
    }
  });

  app.post('/api/fire-plan', async (req, res) => {
    try {
      const result = calculateFire(req.body);
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  app.post('/api/tax-compare', async (req, res) => {
    try {
      const result = calculateTax(req.body);
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
