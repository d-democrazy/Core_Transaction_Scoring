// src/services/scoreService.ts - Score calculation and management
import fs from 'fs';
import path from 'path';
import { ethers } from 'ethers';
import { Transaction, Metrics, AddressScoreFile, TotalScoreFile } from '../types';
import { OUTPUT_DIR, CHAIN_ID, REGISTRY_VERSION } from '../config';

// Initialize metrics state
let globalMetrics: Metrics = {
    totalTransactionsOut: 0,
    totalTransactionsIn: 0,
    totalGasFeesOut: BigInt(0),
    totalGasFeesIn: BigInt(0),
    score: 0,
    address: ''
};

/**
 * Calculate metrics for a set of transactions
 */
export function calculateMetrics(transactions: Transaction[], address: string): Metrics {
    // Normalize the address for case-insensitive comparison
    const normalizedAddress = address.toLowerCase();

    // Reset metrics
    globalMetrics = {
        totalTransactionsOut: 0,
        totalTransactionsIn: 0,
        totalGasFeesOut: BigInt(0),
        totalGasFeesIn: BigInt(0),
        score: 0,
        address: normalizedAddress
    };

    // Calculate metrics based on transaction direction
    transactions.forEach(tx => {
        if (tx.gasPrice && tx.gasUsed) {
            const gasPrice = BigInt(tx.gasPrice);
            const gasUsed = BigInt(tx.gasUsed);
            const gasFee = gasPrice * gasUsed;

            // Check if the transaction is outgoing (address is sender)
            if (tx.from.toLowerCase() === normalizedAddress) {
                globalMetrics.totalTransactionsOut++;
                globalMetrics.totalGasFeesOut += gasFee;
            }
            // Check if the transaction is incoming (address is receiver)
            else if (tx.to && tx.to.toLowerCase() === normalizedAddress) {
                globalMetrics.totalTransactionsIn++;
                globalMetrics.totalGasFeesIn += gasFee;
            }
        }
    });

    // Calculate the score: TxnFeePaid + (TxnFeeInvolved * 0.25)
    const feesPaid = Number(ethers.formatEther(globalMetrics.totalGasFeesOut));
    const feesInvolved = Number(ethers.formatEther(globalMetrics.totalGasFeesIn));
    globalMetrics.score = feesPaid + (feesInvolved * 0.25);

    // Update the address score file
    updateAddressScoreFile(normalizedAddress, globalMetrics.score);

    return globalMetrics;
}

/**
 * Update metrics with a new transaction
 */
export function updateMetricsWithNewTransaction(tx: Transaction): void {
    const normalizedAddress = globalMetrics.address.toLowerCase();

    // Check if transaction is outgoing or incoming
    if (tx.from.toLowerCase() === normalizedAddress) {
        // Outgoing transaction (address is sender)
        globalMetrics.totalTransactionsOut++;

        if (tx.gasPrice && tx.gasUsed) {
            const gasPrice = BigInt(tx.gasPrice);
            const gasUsed = BigInt(tx.gasUsed);
            globalMetrics.totalGasFeesOut += (gasPrice * gasUsed);
        }
    } else if (tx.to && tx.to.toLowerCase() === normalizedAddress) {
        // Incoming transaction (address is receiver)
        globalMetrics.totalTransactionsIn++;

        if (tx.gasPrice && tx.gasUsed) {
            const gasPrice = BigInt(tx.gasPrice);
            const gasUsed = BigInt(tx.gasUsed);
            globalMetrics.totalGasFeesIn += (gasPrice * gasUsed);
        }
    }

    // Recalculate the score
    const feesPaid = Number(ethers.formatEther(globalMetrics.totalGasFeesOut));
    const feesInvolved = Number(ethers.formatEther(globalMetrics.totalGasFeesIn));
    globalMetrics.score = feesPaid + (feesInvolved * 0.25);

    // Update the address score file
    updateAddressScoreFile(normalizedAddress, globalMetrics.score);
}

/**
 * Get current metrics
 */
export function getMetrics(): Metrics {
    return { ...globalMetrics };
}

/**
 * Update all address files with new rankings
 */
export function updateAllAddressFiles(): void {
    const addressFiles = fs.readdirSync(OUTPUT_DIR)
        .filter(file => file.endsWith('.json') && file !== 'TotalScore.json');

    // Calculate total score and collect address scores
    let totalScore = 0;
    const addressScores: { address: string; score: number }[] = [];

    for (const file of addressFiles) {
        const data = JSON.parse(fs.readFileSync(path.join(OUTPUT_DIR, file), 'utf8'));
        const score = data.score.individualScore;
        totalScore += score;
        addressScores.push({ address: data.address, score });
    }

    // Sort addresses by score in descending order
    const sortedScores = [...addressScores].sort((a, b) => b.score - a.score);

    // Update each address file with new rankings
    for (const { address, score } of addressScores) {
        const rank = sortedScores.findIndex(s => s.address === address) + 1;
        const percentile = ((addressScores.length - rank) / addressScores.length * 100).toFixed(1);
        const now = new Date().toISOString();

        const addressData: AddressScoreFile = {
            name: `Gas Score - ${address}`,
            description: "A SoulBound Token that tracks the gas efficiency and network activity score of this address.",
            image: "ipfs://QmImageHashHere",
            external_url: `https://yourdomain.com/score/${address}`,
            registryVersion: REGISTRY_VERSION,
            chainId: CHAIN_ID,
            address: address,
            updatedAt: now,
            score: {
                individualScore: score,
                totalScore: totalScore,
                percentile: `${percentile}%`,
                rank
            },
            attributes: [
                { trait_type: "Individual Score", value: score },
                { trait_type: "Total Score", value: totalScore },
                { trait_type: "Score Percentile", value: `${percentile}%` },
                { trait_type: "Rank", value: rank },
                { trait_type: "Chain", value: `Core (${CHAIN_ID})` },
                { trait_type: "Last Updated", value: now }
            ]
        };

        fs.writeFileSync(path.join(OUTPUT_DIR, `${address}.json`), JSON.stringify(addressData, null, 2));
    }

    // Update the total score file
    updateTotalScoreFile();
}

/**
 * Update the address-specific JSON file
 */
export function updateAddressScoreFile(address: string, score: number): void {
    const addressFile = path.join(OUTPUT_DIR, `${address}.json`);
    const now = new Date().toISOString();

    // Create initial address data (will be updated by updateAllAddressFiles)
    const addressData: AddressScoreFile = {
        name: `Gas Score - ${address}`,
        description: "A SoulBound Token that tracks the gas efficiency and network activity score of this address.",
        image: "ipfs://QmImageHashHere",
        external_url: `https://yourdomain.com/score/${address}`,
        registryVersion: REGISTRY_VERSION,
        chainId: CHAIN_ID,
        address: address,
        updatedAt: now,
        score: {
            individualScore: score,
            totalScore: score,
            percentile: "0%",
            rank: 1
        },
        attributes: [
            { trait_type: "Individual Score", value: score },
            { trait_type: "Total Score", value: score },
            { trait_type: "Score Percentile", value: "0%" },
            { trait_type: "Rank", value: 1 },
            { trait_type: "Chain", value: `Core (${CHAIN_ID})` },
            { trait_type: "Last Updated", value: now }
        ]
    };

    fs.writeFileSync(addressFile, JSON.stringify(addressData, null, 2));

    // Update all address files to reflect new rankings and scores
    updateAllAddressFiles();
}

/**
 * Update the total score file
 */
function updateTotalScoreFile(): void {
    const registryFile = path.join(OUTPUT_DIR, 'TotalScore.json');
    const now = new Date().toISOString();

    // Get all address files
    const addressFiles = fs.readdirSync(OUTPUT_DIR)
        .filter(file => file.endsWith('.json') && file !== 'TotalScore.json');

    // Calculate total score and collect all scores
    let totalScore = 0;
    const allScores: number[] = [];
    const sortedScores: { address: string; score: number }[] = [];

    for (const file of addressFiles) {
        const data = JSON.parse(fs.readFileSync(path.join(OUTPUT_DIR, file), 'utf8'));
        const score = data.score.individualScore;
        totalScore += score;
        allScores.push(score);
        sortedScores.push({ address: data.address, score });
    }

    // Sort scores in descending order
    allScores.sort((a, b) => b - a);
    sortedScores.sort((a, b) => b.score - a.score);

    const totalAddresses = addressFiles.length;
    const averageScore = totalAddresses > 0 ? totalScore / totalAddresses : 0;

    // Calculate score distribution
    const distribution = totalAddresses > 0 ? {
        min: Math.min(...allScores),
        max: Math.max(...allScores),
        median: allScores[Math.floor(allScores.length / 2)] || 0,
        percentiles: {
            "10": allScores[Math.floor(allScores.length * 0.1)] || 0,
            "25": allScores[Math.floor(allScores.length * 0.25)] || 0,
            "50": allScores[Math.floor(allScores.length * 0.5)] || 0,
            "75": allScores[Math.floor(allScores.length * 0.75)] || 0,
            "90": allScores[Math.floor(allScores.length * 0.9)] || 0
        }
    } : {
        min: 0,
        max: 0,
        median: 0,
        percentiles: {
            "10": 0,
            "25": 0,
            "50": 0,
            "75": 0,
            "90": 0
        }
    };

    const registryData: TotalScoreFile = {
        name: "Gas Score Registry",
        description: "Aggregated total gas activity score across all addresses tracked by the GasMonitor system.",
        registryVersion: REGISTRY_VERSION,
        chainId: CHAIN_ID,
        updatedAt: now,
        totalScore,
        totalAddresses,
        topAddress: totalAddresses > 0 ? {
            address: sortedScores[0].address,
            score: sortedScores[0].score
        } : {
            address: "0x0000000000000000000000000000000000000000",
            score: 0
        },
        averageScore,
        scoreDistribution: distribution,
        attributes: [
            { trait_type: "Total Score", value: totalScore },
            { trait_type: "Tracked Addresses", value: totalAddresses },
            { trait_type: "Average Score", value: averageScore },
            { trait_type: "Highest Score", value: distribution.max },
            { trait_type: "Updated At", value: now }
        ]
    };

    fs.writeFileSync(registryFile, JSON.stringify(registryData, null, 2));
} 