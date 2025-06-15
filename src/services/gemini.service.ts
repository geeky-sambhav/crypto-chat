// src/services/gemini.service.ts

import { GoogleGenerativeAI, GenerativeModel, type FunctionDeclarationsTool, SchemaType } from "@google/generative-ai";
import config from '../config';
import { get_current_price, get_coin_stats, list_trending_coins, get_7_day_chart_data } from './crypto.service';
import { add_holding, remove_holding, view_portfolio } from './portfolio.service';

// Initialize the main AI client with your API key
if (!config.geminiApiKey) {
    throw new Error('GEMINI_API_KEY is required but not set');
}
const genAI = new GoogleGenerativeAI(config.geminiApiKey);

// This is the "tool" definition. It describes our local function to the AI.
const tools: FunctionDeclarationsTool[] = [
  {
    functionDeclarations: [
      {
        name: "get_current_price",
        description: "Get the current price of a specific cryptocurrency in USD.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            coinSymbol: {
              type: SchemaType.STRING,
              description: "The symbol of the coin, e.g., 'BTC' for Bitcoin or 'ETH' for Ethereum.",
            },
          },
          required: ["coinSymbol"],
        },
      },
      {
        name: "list_trending_coins",
        description: "generate a list of the top 7 trending coins on CoinGecko right now.",
        parameters: { type: SchemaType.OBJECT, properties: {}, required: [] },
      },
      {
        name: "get_coin_stats",
        description: "Get basic statistics for a specific cryptocurrency, including its market cap, 24-hour price change, and a brief description.",
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                coinSymbol: {
                    type: SchemaType.STRING,
                    description: "The symbol of the coin, e.g., 'BTC' for Bitcoin or 'ETH' for Ethereum.",
                },
            },
            required: ["coinSymbol"],
        },
    },
    {
        name: "get_7_day_chart_data",
        description: "Get historical price data for a cryptocurrency over the last 7 days. Use this when a user asks for a chart, graph, or price history.",
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                coinSymbol: {
                    type: SchemaType.STRING,
                    description: "The symbol of the coin, e.g., 'BTC' for Bitcoin.",
                },
            },
            required: ["coinSymbol"],
        },
    },
    {
        name: "add_holding",
        description: "Add a cryptocurrency to your portfolio.",
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                coinSymbol: {
                    type: SchemaType.STRING,
                    description: "The symbol of the coin, e.g., 'BTC' for Bitcoin.",
                },
                amount: {
                    type: SchemaType.NUMBER,
                    description: "The amount of the cryptocurrency to add.",
                },
            },
            required: ["coinSymbol", "amount"],
        },
    },
    {
        name: "remove_holding",
        description: "Remove a cryptocurrency from your portfolio.",
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                coinSymbol: {
                    type: SchemaType.STRING,
                    description: "The symbol of the coin, e.g., 'BTC' for Bitcoin.",
                },
                amount: {
                    type: SchemaType.NUMBER,
                    description: "The amount of the cryptocurrency to remove.",
                },
            },
            required: ["coinSymbol", "amount"],
        },
    },
    {
        name: "view_portfolio",
        description: "View your current cryptocurrency portfolio with current values.",
        parameters: {
            type: SchemaType.OBJECT,
            properties: {},
            required: [],
        },
    },
    ],
  },
];

/**
 * This is our AI model, configured to use the tools we defined.
 * We are using a specific model version and passing our function definitions.
 */
const model: GenerativeModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash", // Use a modern, fast model
  tools: tools,
});

// We create an object that maps function names to the actual functions.
// This makes it easy to call the correct function when the AI asks for it.
export const availableTools = {
  get_current_price,
  get_coin_stats,
  list_trending_coins,
  get_7_day_chart_data,
  add_holding,
  remove_holding,
  view_portfolio
};

// Export the configured model to be used by our chat controller.
export default model;