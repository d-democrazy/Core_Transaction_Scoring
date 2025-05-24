import express from 'express';
import cors from 'cors';
import { scoreRoutes } from './routes/scoreRoutes';

const app = express();
const PORT = process.env.API_PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', scoreRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

export function startServer() {
    return app.listen(PORT, () => {
        console.log(`API server running on port ${PORT}`);
    });
} 