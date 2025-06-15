// src/services/portfolio.service.ts

import { get_current_price } from './crypto.service';
import { randomUUID } from 'crypto'; // For generating unique IDs

// This is our new in-memory "database" that holds multiple portfolios
const portfolios: { [sessionId: string]: { [coinSymbol: string]: number } } = {};

/**
 * Finds or creates a portfolio for a given session ID.
 * @param sessionId The unique ID for the user's session.
 * @returns The portfolio object for that session.
 */
function getPortfolioForSession(sessionId: string) {
    if (!portfolios[sessionId]) {
        portfolios[sessionId] = {}; // Create an empty portfolio if it's a new session
    }
    return portfolios[sessionId];
}

// All functions now accept a sessionId!
export async function add_holding(sessionId: string, coinSymbol: string, amount: number): Promise<string> {
    const userPortfolio = getPortfolioForSession(sessionId);
    const symbol = coinSymbol.toUpperCase();

    if (userPortfolio[symbol]) {
        userPortfolio[symbol] += amount;
    } else {
        userPortfolio[symbol] = amount;
    }
    return `Successfully added ${amount} ${symbol}. You now hold ${userPortfolio[symbol]} ${symbol}.`;
}

export async function remove_holding(sessionId: string, coinSymbol:string, amount: number): Promise<string> {
    const userPortfolio = getPortfolioForSession(sessionId);
    const symbol = coinSymbol.toUpperCase();

    if (!userPortfolio[symbol] || userPortfolio[symbol] < amount) {
        return `Error: You don't have enough ${symbol} to remove. You only hold ${userPortfolio[symbol] || 0}.`;
    }
    userPortfolio[symbol] -= amount;
    if (userPortfolio[symbol] === 0) {
        delete userPortfolio[symbol];
    }
    return `Successfully removed ${amount} ${symbol}.`;
}

export async function view_portfolio(sessionId: string): Promise<object> {
    const userPortfolio = getPortfolioForSession(sessionId);
    if (Object.keys(userPortfolio).length === 0) {
        return { message: "Your portfolio is currently empty." };
    }

    let totalValue = 0;
    const detailedPortfolio: { [key: string]: { amount: number, value: number } } = {};

    for (const symbol in userPortfolio) {
        const amount = userPortfolio[symbol];
        try {
            const price = await get_current_price(symbol);
            const value = amount * price;
            detailedPortfolio[symbol] = { amount, value };
            totalValue += value;
        } catch (error) {
            console.error(`Could not fetch price for ${symbol}:`, error);
            detailedPortfolio[symbol] = { amount, value: 0 };
        }
    }

    return {
        totalValue,
        holdings: detailedPortfolio
    };
}