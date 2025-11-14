import express, { Application, NextFunction, Request, Response } from 'express';
import { config } from './config/env';
import { HomeAssistantClient, HomeAssistantRequestError } from './clients/homeAssistantClient';
import { createRealTimeRouter } from './routes/realTimeRouter';

export const createApp = (): Application => {
  const app = express();
  const homeAssistantClient = new HomeAssistantClient(config.homeAssistant);

  app.set('trust proxy', true);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/healthz', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/real-time', createRealTimeRouter(homeAssistantClient, config.homeAssistant.sensors));

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof HomeAssistantRequestError) {
      res.status(err.status ?? 502).json({
        error: err.message,
        sensorId: err.sensorId,
      });
      return;
    }

    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
};
