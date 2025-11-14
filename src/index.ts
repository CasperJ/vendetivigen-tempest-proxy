import { createApp } from './app';
import { config } from './config/env';

const app = createApp();

app.listen(config.port, () => {
  console.log(`Tempest proxy listening on port ${config.port}`);
});
