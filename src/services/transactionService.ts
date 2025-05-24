// src/services/transactionService.ts - Transaction-related services
import axios from 'axios';
import chalk from 'chalk';
import { Transaction } from '../types';
import { ENDPOINT_URL, API_KEY, START_BLOCK, END_BLOCK, OFFSET, SORT } from '../config';

/**
 * Fetch all transactions for a given address
 */
export async function fetchAllTransactions(address: string): Promise<Transaction[]> {
    let startBlock = START_BLOCK;
    let page = 1;
    let transactions: Transaction[] = [];

    console.log(chalk.cyan(`Fetching transactions starting from block ${startBlock}...`));

    while (true) {
        const url = `${ENDPOINT_URL}/accounts/list_of_txs_by_address/${address}?apikey=${API_KEY}&endblock=${END_BLOCK}&offset=${OFFSET}&page=${page}&sort=${SORT}&startblock=${startBlock}`;

        console.log(chalk.dim(`Fetching page ${page} for new transactions...`));

        try {
            const response = await axios.get(url);
            const result = response.data.result;

            if (!Array.isArray(result) || result.length === 0) {
                console.log(chalk.dim('No more transactions found.'));
                break;
            }

            transactions = transactions.concat(result);
            console.log(chalk.dim(`Fetched ${result.length} txs (Total: ${transactions.length})`));
            page++;

        } catch (error: any) {
            console.error(chalk.red(`Error fetching page ${page}:`), error.message);
            if (error.response) {
                console.error(chalk.red('API Response:'), error.response.data);
            }
            break;
        }
    }

    return transactions;
}