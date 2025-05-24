# Core Transaction Gas Tracker and Scoring

A tool to track and analyze gas fees spent by Core blockchain addresses.

## Features

- Track real-time gas fee usage for any Core address
- Calculate cumulative gas scores
- Monitor new transactions
- Generate score metrics and rankings
- RESTful API for accessing score data

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Access to Core blockchain API and RPC

## Installation

1. Clone the repository:
```bash
git clone https://github.com/d-democrazy/Core_Transaction_Scoring.git
cd Core_Transaction_Scoring
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following content:
```
ENDPOINT_URL=https://openapi.coredao.org/api
API_KEY=your_api_key_here
RPC_URL=https://rpc.coredao.org
EXPLORER=https://scan.coredao.org
API_PORT=your_specified_api_port
```

## Usage

### CLI Mode

Run the application in CLI mode to track transactions in real-time:

```bash
npm start
```

This will prompt you to enter a Core address and start monitoring its transactions.

### API Mode

Run the application in API mode to expose score data through REST endpoints:

```bash
npm run api
```

The API server will start on `localhost:3000` (or the port specified in `API_PORT`).

## API Endpoints

### Get Individual Address Score
```
GET /api/scores/:address
```
Returns score data for a specific address.

**Response Example:**
```json
{
    "address": "0x...",
    "individualScore": 123.45,
    "totalScore": 1000.00,
    "rank": 5,
    "percentile": "95%",
    "lastUpdated": "2024-03-20T12:00:00Z"
}
```

### Get Total Score Data
```
GET /api/scores/total
```
Returns aggregated score data across all tracked addresses.

**Response Example:**
```json
{
    "totalScore": 1000.00,
    "totalAddresses": 50,
    "averageScore": 20.00,
    "topAddress": {
        "address": "0x...",
        "score": 123.45
    },
    "lastUpdated": "2024-03-20T12:00:00Z",
    "distribution": {
        "min": 0.1,
        "max": 123.45,
        "median": 15.5,
        "percentiles": {
            "10": 5.0,
            "25": 10.0,
            "50": 15.5,
            "75": 25.0,
            "90": 50.0
        }
    }
}
```

### Get All Addresses Scores
```
GET /api/scores
```
Returns score data for all tracked addresses.

**Response Example:**
```json
[
    {
        "address": "0x...",
        "individualScore": 123.45,
        "rank": 5,
        "percentile": "95%",
        "lastUpdated": "2024-03-20T12:00:00Z"
    },
    // ... more addresses
]
```

## Error Responses

The API returns the following error responses:

- `400 Bad Request`: Invalid address format
- `404 Not Found`: Address or score data not found
- `500 Internal Server Error`: Server-side error

## License

MIT

## Author

bhrepantheon