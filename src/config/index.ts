// src/config/index.ts - Configuration and environment settings
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Environment variables
export const ENDPOINT_URL = process.env.ENDPOINT_URL;
export const API_KEY = process.env.API_KEY;
export const RPC_URL = process.env.RPC_URL;
export const EXPLORER = process.env.EXPLORER;

// Validate environment variables
if (!ENDPOINT_URL || !API_KEY || !RPC_URL || !EXPLORER) {
    throw new Error('Required environment variables are missing. Please check your .env file.');
}

// Chain Configuration
export const CHAIN_ID = 1114;
export const REGISTRY_VERSION = '1.0.0';

// File System Configuration
export const OUTPUT_DIR = 'output';

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Transaction Query Parameters
export const START_BLOCK = 0;
export const END_BLOCK = 999999999;
export const OFFSET = 100;
export const SORT = 'asc';