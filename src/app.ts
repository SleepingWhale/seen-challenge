import fastify, { FastifyInstance, FastifyServerOptions } from 'fastify';
import helmet from '@fastify/helmet';
import { transactionDBPlugin, TransactionRepository } from './models/transaction';
import { routes } from './modules';

declare module 'fastify' {
  interface FastifyInstance {
    transactionDB: TransactionRepository;
  }
}

export function build(opts: FastifyServerOptions = {}): FastifyInstance {
  const app = fastify(opts);

  app.setErrorHandler((error, request, reply) => {
    reply.status(500).send({ ok: false });
  });
  app.register(helmet);
  app.register(transactionDBPlugin);
  app.register(routes);

  return app;
}
