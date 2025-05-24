// src/index.ts - Main application entry point
import { ethers } from 'ethers';
import chalk from 'chalk';
import { getUserInput } from './utils/input';
import { fetchAllTransactions } from './services/transactionService';
import { calculateMetrics } from './services/scoreService';
import { displayMetrics } from './services/displayService';
import { watchNewTransactions } from './services/watcherService';
import { startServer } from './api/server';

// Check if running in API mode
const isApiMode = process.argv.includes('--api');

/**
 * Main function to start the application
 */
async function main() {
    if (isApiMode) {
        console.log(chalk.cyan('Starting in API mode...'));
        startServer();
        return;
    }

    try {
        // Get user input for address
        const address = await getUserInput('Please enter a Core address: ');

        if (!ethers.isAddress(address)) {
            console.error(chalk.red('Error: Invalid address'));
            process.exit(1);
        }

        console.log(chalk.cyan(`\n📊 Processing transactions for ${address}...\n`));

        // Fetch transactions
        const transactions = await fetchAllTransactions(address);

        // Calculate and display metrics
        const metrics = calculateMetrics(transactions, address);
        displayMetrics(metrics, true);

        // Start watching for new transactions automatically
        console.log(chalk.magenta(`\n👀 Starting transaction watcher automatically...`));
        watchNewTransactions(address);

    } catch (error) {
        console.error(chalk.red('Error in main function:'), error);
        process.exit(1);
    }
}

// Start the application
main();