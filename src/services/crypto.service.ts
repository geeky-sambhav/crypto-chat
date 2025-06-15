import config from "../config";

// The base URL for the CoinGecko API
const API_BASE_URL = 'https://api.coingecko.com/api/v3';

interface CoinStats {
    symbol: string;
    market_cap: number;
    price_change_percentage_24h: number;
    description: string;
}

interface TrendingCoin {
    id: string;
    name: string;
    symbol: string;
}

/**
 * A mapping from common coin symbols (like BTC) to the ID CoinGecko uses (like bitcoin).
 * This makes our chatbot more user-friendly.
 */
const coinIdMap: { [key: string]: string } = {
    btc: 'bitcoin',
    eth: 'ethereum',
    sol: 'solana',
    doge: 'dogecoin',
    // Add other coins you want to support
};

/**
 * Fetches the current price of a given cryptocurrency from the CoinGecko API.
 * This is the function that Gemini will learn to call.
 * @param coinSymbol The symbol of the coin (e.g., 'BTC', 'ETH').
 * @returns The current price in USD.
 */
export async function get_current_price(coinSymbol: string): Promise<number> {
    // Convert the user-friendly symbol to the ID CoinGecko needs, e.g., "BTC" -> "bitcoin"
    const lowerCaseSymbol = coinSymbol.toLowerCase();
    const coinId = coinIdMap[lowerCaseSymbol];

    if (!coinId) {
        throw new Error(`Cryptocurrency '${coinSymbol}' not supported.`);
    }

    try {
        // Construct the full API URL
        const url = `${API_BASE_URL}/simple/price?ids=${coinId}&vs_currencies=usd`;
        console.log(`Fetching price from URL: ${url}`);

        // Make the API request using Bun's built-in fetch
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                ...(config.coinGeckoApiKey && { 'x-cg-demo-api-key': config.coinGeckoApiKey }),
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch price data. Status: ${response.status}`);
        }

        const data = await response.json();

        // The data comes back in a nested object, e.g., { "bitcoin": { "usd": 65000 } }
        const price = data[coinId]?.usd;

        if (price === undefined) {
            throw new Error(`Price for '${coinSymbol}' not found in API response.`);
        }

        return price;

    } catch (error) {
        console.error('Error fetching crypto price:', error);
        // Re-throw the error so the calling function can handle it
        throw error;
    }
}

/**
 * Fetches detailed statistics for a given cryptocurrency.
 * @param coinSymbol The symbol of the coin (e.g., 'BTC', 'ETH').
 * @returns An object containing the coin's stats.
 */
export async function get_coin_stats(coinSymbol: string): Promise<CoinStats> {
    // We reuse the same map to get the coin's ID from its symbol
    const lowerCaseSymbol = coinSymbol.toLowerCase();
    const coinId = coinIdMap[lowerCaseSymbol];

    if (!coinId) {
        throw new Error(`Cryptocurrency '${coinSymbol}' not supported.`);
    }

    try {
        // This is a different, more detailed API endpoint
        const url = `${API_BASE_URL}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`;
        console.log(`Fetching stats from URL: ${url}`);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                ...(config.coinGeckoApiKey && { 'x-cg-demo-api-key': config.coinGeckoApiKey }),
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch stats. Status: ${response.status}`);
        }

        const data = await response.json();

        // We pick and choose the specific data points we need from the large response
        const stats: CoinStats = {
            symbol: data.symbol.toUpperCase(),
            market_cap: data.market_data.market_cap.usd,
            price_change_percentage_24h: data.market_data.price_change_percentage_24h,
            description: data.description.en.split('. ')[0] + '.', // Get the first sentence of the description
        };

        return stats;

    } catch (error) {
        console.error('Error fetching coin stats:', error);
        throw error;
    }
}


export async function list_trending_coins(): Promise<TrendingCoin[]> {
    try {
        const url = `https://api.coingecko.com/api/v3/search/trending`;
        const response = await fetch(url, {
            method: 'GET',
            headers: { ...(config.coinGeckoApiKey && { 'x-cg-demo-api-key': config.coinGeckoApiKey }) },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch trending data.`);
        }

        const data = await response.json();
        const trendingCoins = data.coins.map((item: any) => ({
            id: item.item.id,
            name: item.item.name,
            symbol: item.item.symbol,
        }));
        return trendingCoins;

    } catch (error) {
        console.error('Error fetching trending coins:', error);
        throw error;
    }
}

/**
 * Fetches the last 7 days of price data for a given cryptocurrency,
 * suitable for drawing a chart.
 * @param coinSymbol The symbol of the coin (e.g., 'BTC', 'ETH').
 * @returns An array of [timestamp, price] tuples.
 */
export async function get_7_day_chart_data(coinSymbol: string): Promise<[number, number][]> {
    const lowerCaseSymbol = coinSymbol.toLowerCase();
    const coinId = coinIdMap[lowerCaseSymbol];

    if (!coinId) {
        throw new Error(`Cryptocurrency '${coinSymbol}' not supported.`);
    }

    try {
        // This endpoint provides historical data
        const url = `${API_BASE_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=7&interval=daily`;
        console.log(`Fetching chart data from URL: ${url}`);

        const response = await fetch(url, {
            method: 'GET',
            headers: { ...(config.coinGeckoApiKey && { 'x-cg-demo-api-key': config.coinGeckoApiKey }) },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch chart data. Status: ${response.status}`);
        }

        const data = await response.json();

        // The API returns an object with a 'prices' property, 
        // which is an array of [timestamp, price]. This is exactly what we need.
        const chartData: [number, number][] = data.prices;

        return chartData;

    } catch (error) {
        console.error('Error fetching chart data:', error);
        throw error;
    }
}