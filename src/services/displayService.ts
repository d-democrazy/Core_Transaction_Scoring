// src/services/displayService.ts - CLI display and formatting
import chalk from 'chalk';
import Table from 'cli-table3';
import { ethers } from 'ethers';
import { Metrics } from '../types';
import { EXPLORER } from '../config';

// Create a table for metrics display
let metricsTable: any;

/**
 * Clear the console screen
 */
function clearScreen(): void {
    process.stdout.write('\x1Bc');
}

/**
 * Display transaction metrics in a table
 */
export function displayMetrics(metrics: Metrics, clearConsole: boolean = false): void {
    // Clear screen if requested
    if (clearConsole) {
        clearScreen();
    }

    // Convert Wei to Ether (18 decimals)
    const totalGasFeesOutInEther = ethers.formatEther(metrics.totalGasFeesOut);
    const totalGasFeesInInEther = ethers.formatEther(metrics.totalGasFeesIn);

    // Create new metrics table
    metricsTable = new Table({
        head: [
            chalk.cyan('Metric'),
            chalk.cyan('Value (TxnFeePaid)'),
            chalk.cyan('Value (TxnFeeInvolved)')
        ],
        style: { head: [], border: [] },
        colAligns: ['left', 'center', 'center']
    });

    // Add transaction counts
    metricsTable.push([
        'Total Transactions',
        chalk.yellow(metrics.totalTransactionsOut.toString()),
        chalk.yellow(metrics.totalTransactionsIn.toString())
    ]);

    // Add gas fees
    metricsTable.push([
        'Total Gas Fees (CORE)',
        chalk.yellow(totalGasFeesOutInEther),
        chalk.yellow(totalGasFeesInInEther)
    ]);

    // Add individual score
    metricsTable.push([
        'Score',
        { content: chalk.yellow(metrics.score.toFixed(8)), colSpan: 2 }
    ]);

    // Display explorer link
    console.log(chalk.blue(`\n🔗 Explorer Link`));
    console.log(chalk.blue(`View address on explorer: ${EXPLORER}/address/${metrics.address}\n`));

    // Display table
    console.log(metricsTable.toString());

    // Display watching message
    console.log(chalk.magenta(`\n👀 Watching for new transactions...`));
    console.log(chalk.yellow(`Press Ctrl+C to stop watching and exit`));
}

/**
 * Display a new transaction notification
 */
export function displayNewTransaction(
    blockNumber: number | bigint,
    direction: 'IN' | 'OUT',
    txHash: string,
    from: string,
    to: string | null,
    value: bigint,
    gasUsed: bigint,
    gasFee: bigint
): void {
    console.log(chalk.green(`\n🔔 New transaction detected in block ${blockNumber}:`));
    console.log(chalk.yellow(`Direction: ${direction}`));
    console.log(chalk.yellow(`Transaction Hash: ${txHash}`));
    console.log(chalk.yellow(`From: ${from}`));
    console.log(chalk.yellow(`To: ${to || 'Contract Creation'}`));
    console.log(chalk.yellow(`Value: ${ethers.formatUnits(value, 8)} CORE`));
    console.log(chalk.yellow(`Gas Used: ${gasUsed.toString()}`));
    console.log(chalk.yellow(`Gas Fee: ${ethers.formatEther(gasFee)} CORE`));
    console.log(chalk.blue(`View transaction: ${EXPLORER}/tx/${txHash}`));
} 