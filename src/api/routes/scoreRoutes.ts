import { Router, Request, Response, RequestHandler } from 'express';
import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { OUTPUT_DIR } from '../../config';
import { AddressScoreFile, TotalScoreFile } from '../../types';

const router = Router();

// Define types for request parameters
interface AddressParams {
    address: string;
}

/**
 * Get score data for a specific address
 * GET /api/scores/:address
 */
const getAddressScore: RequestHandler<AddressParams> = async (req, res) => {
    try {
        const { address } = req.params;

        // Validate address
        if (!ethers.isAddress(address)) {
            res.status(400).json({ error: 'Invalid address format' });
            return;
        }

        // Check if address file exists
        const addressFile = path.join(OUTPUT_DIR, `${address}.json`);
        if (!fs.existsSync(addressFile)) {
            res.status(404).json({ error: 'Address not found' });
            return;
        }

        // Read address data
        const addressData: AddressScoreFile = JSON.parse(fs.readFileSync(addressFile, 'utf8'));

        // Read total score data
        const totalScoreFile = path.join(OUTPUT_DIR, 'TotalScore.json');
        const totalScoreData: TotalScoreFile = JSON.parse(fs.readFileSync(totalScoreFile, 'utf8'));

        // Format response
        const response = {
            address: addressData.address,
            individualScore: addressData.score.individualScore,
            totalScore: totalScoreData.totalScore,
            rank: addressData.score.rank,
            percentile: addressData.score.percentile,
            lastUpdated: addressData.updatedAt
        };

        res.json(response);
    } catch (error) {
        console.error('Error fetching score data:', error);
        res.status(500).json({ error: 'Failed to fetch score data' });
    }
};

/**
 * Get total score data
 * GET /api/scores/total
 */
const getTotalScore: RequestHandler = async (req, res) => {
    try {
        const totalScoreFile = path.join(OUTPUT_DIR, 'TotalScore.json');
        if (!fs.existsSync(totalScoreFile)) {
            res.status(404).json({ error: 'Total score data not found' });
            return;
        }

        const totalScoreData: TotalScoreFile = JSON.parse(fs.readFileSync(totalScoreFile, 'utf8'));

        // Format response
        const response = {
            totalScore: totalScoreData.totalScore,
            totalAddresses: totalScoreData.totalAddresses,
            averageScore: totalScoreData.averageScore,
            topAddress: totalScoreData.topAddress,
            lastUpdated: totalScoreData.updatedAt,
            distribution: totalScoreData.scoreDistribution
        };

        res.json(response);
    } catch (error) {
        console.error('Error fetching total score data:', error);
        res.status(500).json({ error: 'Failed to fetch total score data' });
    }
};

/**
 * Get all addresses scores
 * GET /api/scores
 */
const getAllScores: RequestHandler = async (req, res) => {
    try {
        const addresses = fs.readdirSync(OUTPUT_DIR)
            .filter(file => file.endsWith('.json') && file !== 'TotalScore.json')
            .map(file => {
                const data: AddressScoreFile = JSON.parse(
                    fs.readFileSync(path.join(OUTPUT_DIR, file), 'utf8')
                );
                return {
                    address: data.address,
                    individualScore: data.score.individualScore,
                    rank: data.score.rank,
                    percentile: data.score.percentile,
                    lastUpdated: data.updatedAt
                };
            });

        res.json(addresses);
    } catch (error) {
        console.error('Error fetching all scores:', error);
        res.status(500).json({ error: 'Failed to fetch all scores' });
    }
};

// Register routes
router.get('/scores/total', getTotalScore);
router.get('/scores', getAllScores);
router.get('/scores/:address', getAddressScore);

export const scoreRoutes = router; 