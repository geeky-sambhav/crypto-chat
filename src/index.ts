import express from 'express';
import type { Request, Response } from 'express';
import { get_current_price } from './services/crypto.service';
import { handleChat } from './controllers/chat.controller';
import cors from 'cors';
const app = express();
import { Buffer } from 'node:buffer';
globalThis.Buffer = Buffer;

const port = process.env.PORT ;
app.use(express.json());
app.use(cors()); // <--- 2. THIS IS THE MOST IMPORTANT LINE. It must be here.

app.get('/', (req: Request, res: Response): void => {
  res.send('Crypto Chat Backend');
});
app.post('/api/chat', async (req: Request, res: Response) => {
  await handleChat(req, res);
});

app.get('/price/:symbol', async (req: Request, res: Response): Promise<void> => {
  const { symbol } = req.params;
  
  if (!symbol) {
    res.status(400).json({ error: 'Coin symbol is required.' });
    return;
  }

  try {
    const price = await get_current_price(symbol);
    res.json({ symbol, price });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch price' });
  }
});

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
