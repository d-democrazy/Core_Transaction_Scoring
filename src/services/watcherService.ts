// src/services/watcherService.ts - Real-time transaction monitoring
import { ethers } from 'ethers';
import chalk from 'chalk';
import { Transaction } from '../types';
import { RPC_URL } from '../config';
import { updateMetricsWithNewTransaction, getMetrics } from './scoreService';
import { displayMetrics, displayNewTransaction } from './displayService';

/**
 * Watch for new transactions using RPC
 */
export async function watchNewTransactions(address: string): Promise<void> {
    try {
        // Initial display setup
        displayMetrics(getMetrics(), true);

        // Connect to the provider
        const provider = new ethers.JsonRpcProvider(RPC_URL);

        // Listen for new blocks
        provider.on('block', async (blockNumber) => {
            try {
                // Get the block
                const block = await provider.getBlock(blockNumber);

                if (block && block.transactions) {
                    // For each transaction hash in the block
                    for (const txHash of block.transactions) {
                        // Get transaction details
                        const tx = await provider.getTransaction(txHash);

                        if (tx) {
                            // Check if this transaction involves our address
                            if (tx.from.toLowerCase() === address.toLowerCase() ||
                                (tx.to && tx.to.toLowerCase() === address.toLowerCase())) {

                                // Get receipt to get gas used
                                const receipt = await provider.getTransactionReceipt(txHash);

                                if (receipt) {
                                    const gasUsed = receipt.gasUsed;
                                    const gasPrice = tx.gasPrice;
                                    const gasFee = gasUsed * gasPrice;

                                    // Determine transaction direction
                                    const direction = tx.from.toLowerCase() === address.toLowerCase()
                                        ? 'OUT'
                                        : 'IN';

                                    // Create a transaction object
                                    const newTransaction: Transaction = {
                                        blockNumber: blockNumber.toString(),
                                        timeStamp: Math.floor(Date.now() / 1000).toString(),
                                        hash: txHash,
                                        from: tx.from,
                                        to: tx.to || '',
                                        value: tx.value.toString(),
                                        gas: tx.gasLimit.toString(),
                                        gasPrice: tx.gasPrice?.toString() || '0',
                                        gasUsed: gasUsed.toString()
                                    };

                                    // Update metrics
                                    updateMetricsWithNewTransaction(newTransaction);

                                    // Clear screen and display updated metrics
                                    displayMetrics(getMetrics(), true);

                                    // Display the transaction
                                    displayNewTransaction(
                                        blockNumber,
                                        direction,
                                        txHash,
                                        tx.from,
                                        tx.to,
                                        tx.value,
                                        gasUsed,
                                        gasFee
                                    );
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                console.error(chalk.red('Error processing block:'), error);
            }
        });

        // Keep the process running
        process.stdin.resume();

        // Handle exit
        process.on('SIGINT', () => {
            console.log(chalk.yellow('\nStopping transaction watcher...'));
            process.exit(0);
        });

    } catch (error) {
        console.error(chalk.red('Error watching for transactions:'), error);
        process.exit(1);
    }
}