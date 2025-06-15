# Conversational Crypto Web-Chat Backend

This is the backend for a conversational AI chatbot designed to provide information about cryptocurrencies. It is powered by Node.js, Bun, and Google's Gemini API for natural language understanding and function calling.

## 🌟 Features

- **Conversational AI**: Uses Google Gemini to understand user queries and hold a conversation.
- **Function Calling**: Seamlessly integrates with external APIs to fetch live data.
- **Live Crypto Data**: Provides real-time information for various cryptocurrencies.
  - Get current price of any coin.
  - List top trending coins.
  - Show detailed stats (market cap, 24h change, description).
  - Fetch 7-day price history for charting.
- **Session-Based Portfolio**: Allows users to track their crypto holdings in a session-specific portfolio.
  - Add or remove holdings.
  - View the current value of the entire portfolio.
- **Scalable Architecture**: Built with a modular service and controller pattern, making it easy to add new tools and capabilities.

## 🛠️ Tech Stack

- **Runtime**: Bun (with Node.js compatibility)
- **Language**: TypeScript
- **Framework**: Express.js
- **Core AI**: Google Gemini API (`@google/generative-ai`)
- **Crypto Data**: CoinGecko API

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

You must have [Bun](https://bun.sh/) installed on your system.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/geeky-sambhav/crypto-chat.git](https://github.com/geeky-sambhav/crypto-chat.git)
    cd crypto-chat
    ```

2.  **Install dependencies:**
    ```bash
    bun install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root directory by copying the example file:
    ```bash
    cp .env.example .env
    ```
    Now, open the `.env` file and add your actual API keys from Google AI Studio and CoinGecko.

### Running the Application

-   **Development Mode:**
    To run the server with hot-reloading:
    ```bash
    bun run dev
    ```
    The server will be available at `http://localhost:8000`.

-   **Production Mode:**
    To build an optimized version of the application:
    ```bash
    bun run build
    ```
    To run the built application:
    ```bash
    bun run start
    ```

## ⚙️ API Usage

### Chat Endpoint

- **URL**: `/api/chat`
- **Method**: `POST`
- **Body**:

  ```json
  {
    "message": "Your question or command here",
    "sessionId": "optional-session-id"
  }