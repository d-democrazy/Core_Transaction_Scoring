// src/types/index.ts - Type definitions

export interface ScoreData {
    individualScore: number;
    totalScore: number;
    percentile: string;
    rank: number;
}

export interface Attribute {
    trait_type: string;
    value: string | number;
}

export interface Transaction {
    blockNumber: string;
    timeStamp: string;
    hash: string;
    from: string;
    to: string;
    value: string;
    gas: string;
    gasPrice: string;
    gasUsed: string;
    [key: string]: string | number;
}

export interface AddressScoreFile {
    name: string;
    description: string;
    image: string;
    external_url: string;
    registryVersion: string;
    chainId: number;
    address: string;
    updatedAt: string;
    score: ScoreData;
    attributes: Attribute[];
}

export interface ScoreDistribution {
    min: number;
    max: number;
    median: number;
    percentiles: {
        [key: string]: number;
    };
}

export interface TopAddress {
    address: string;
    score: number;
}

export interface TotalScoreFile {
    name: string;
    description: string;
    registryVersion: string;
    chainId: number;
    updatedAt: string;
    totalScore: number;
    totalAddresses: number;
    topAddress: TopAddress;
    averageScore: number;
    scoreDistribution: ScoreDistribution;
    attributes: Attribute[];
}

export interface Metrics {
    totalTransactionsOut: number;
    totalTransactionsIn: number;
    totalGasFeesOut: bigint;
    totalGasFeesIn: bigint;
    score: number;
    address: string;
}