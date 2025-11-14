import { Router, Request, Response, NextFunction } from 'express';
import { HomeAssistantClient } from '../clients/homeAssistantClient';

const toSensorList = (value: string | undefined): string[] => {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((sensor) => sensor.trim())
    .filter((sensor) => sensor.length > 0);
};

export const createRealTimeRouter = (
  client: HomeAssistantClient,
  defaultSensors: string[],
): Router => {
  const router = Router();

  router.get('/', async (req: Request, res: Response, next: NextFunction) => {

    try {
      const data = await client.fetchMany([...new Set(defaultSensors)]);
      res.json({
        refreshedAt: new Date().toISOString(),
        sensors: data,
        total: data.length,
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
};
