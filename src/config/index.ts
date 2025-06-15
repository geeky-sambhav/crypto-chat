
import 'dotenv/config'; 

/**
 * A centralized and type-safe configuration object.
 * It fetches values from environment variables and provides defaults.
 * It will throw an error at startup if a critical variable is missing.
 */
const config = {
    geminiApiKey: process.env.GEMINI_API_KEY,
    coinGeckoApiKey: process.env.COINGECKO_API_KEY,
    // Add other configurations here
};

// Validate that critical environment variables are set
if (!config.geminiApiKey) {
    throw new Error("GEMINI_API_KEY is not set in the environment variables. Please check your .env file.");
}
if (!config.coinGeckoApiKey) {
    throw new Error("COINGECKO_API_KEY is not set in the environment variables. Please check your .env file.");
}

// Export a read-only version of the config
export default Object.freeze(config);