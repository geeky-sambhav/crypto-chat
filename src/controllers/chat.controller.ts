// src/controllers/chat.controller.ts

import { type Request, type Response } from 'express';
import model, { availableTools } from '../services/gemini.service';
import { randomUUID } from 'crypto';

interface FunctionArgs {
    coinSymbol?: string;
    amount?: number;
}

function validateCoinSymbol(coinSymbol: string | undefined, functionName: string): string {
    if (!coinSymbol) {
        throw new Error(`Missing required 'coinSymbol' argument for function '${functionName}'`);
    }
    return coinSymbol;
}

/**
 * Handles incoming chat messages, orchestrates the interaction with the Gemini model
 * and its tools, and sends back a final response.
 */
export async function handleChat(req: Request, res: Response) {
    const { message, sessionId: incomingSessionId } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required.' });
    }
    const sessionId = incomingSessionId || randomUUID();

    try {
        const chat = model.startChat();
        const result = await chat.sendMessage(message);
        const geminiResponse = result.response;
        const functionCalls = geminiResponse.functionCalls();

        if (functionCalls && functionCalls.length > 0) {
            const call = functionCalls[0];
            const { name, args } = call;
            const typedArgs = args as FunctionArgs;

            console.log(`Gemini wants to call function: "${name}" with args:`, args);

            try {
                // This variable will hold the result from our local function
                let toolResult;
                if (name === 'get_7_day_chart_data') {
                    const chartData = await availableTools.get_7_day_chart_data(typedArgs.coinSymbol as string);
                    // We send the raw data directly to the frontend with a 'chart' type.
                    return res.json({ type: 'chart', content: chartData, sessionId: sessionId });
                }
                // This is the scalable way to handle multiple tools
                switch (name) {
                    case 'get_current_price':
                        const priceSymbol = validateCoinSymbol(typedArgs.coinSymbol, name);
                        toolResult = await availableTools.get_current_price(priceSymbol);
                        break;

                    case 'list_trending_coins':
                        toolResult = await availableTools.list_trending_coins();
                        break;

                    case 'get_coin_stats':
                        const statsSymbol = validateCoinSymbol(typedArgs.coinSymbol, name);
                        toolResult = await availableTools.get_coin_stats(statsSymbol);
                        break;

                    case 'get_7_day_chart_data':
                        const chartSymbol = validateCoinSymbol(typedArgs.coinSymbol, name);
                        toolResult = await availableTools.get_7_day_chart_data(chartSymbol);
                        break;

                    case 'add_holding':
                        toolResult = await availableTools.add_holding(sessionId, typedArgs.coinSymbol as string, typedArgs.amount as number);
                        break;
                    case 'remove_holding':
                        toolResult = await availableTools.remove_holding(sessionId, typedArgs.coinSymbol as string, typedArgs.amount as number);
                        break;
                    case 'view_portfolio':
                        toolResult = await availableTools.view_portfolio(sessionId);
                        break;
                    default:
                        return res.status(500).json({ error: `Function '${name}' is not implemented.` });
                }

                // This part stays the same: send the result back to Gemini
                const finalResult = await chat.sendMessage([
                    {
                        functionResponse: {
                            name,
                            response: {
                                name,
                                content: JSON.stringify({ result: toolResult }),
                            },
                        },
                    },
                ]);
                
                const finalResponseText = finalResult.response.text();
                res.json({ type: 'text', content: finalResponseText, sessionId: sessionId });
            } catch (error) {
                console.error(`Error executing function ${name}:`, error);
                res.status(500).json({ 
                    error: error instanceof Error ? error.message : 'An error occurred while processing your request'
                });
            }
        } else {
            // This part for direct answers also stays the same
            const directResponse = geminiResponse.text();
            res.json({ type: 'text', content: directResponse, sessionId: sessionId });
        }
    } catch (error) {
        console.error('Error in chat handling:', error);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
}