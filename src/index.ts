import { build } from './app';

const app = build({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
    },
  },
});

const start = async () => {
  try {
    await app.listen({ port: 3000 });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
