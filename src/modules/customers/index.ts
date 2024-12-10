import { FastifyInstance } from 'fastify';
import { transactionsHandler } from './transactions/handler';
import { AggregatedTransactionsResponseShema, AggregatedTransactionRequestShema } from './transactions/dto';
import { relatedCustomersHandler } from './related-customers/handler';
import { RelatedCustomersResponseShema, RelatedCustomersRequestShema } from './related-customers/dto';

export async function customersRoutes(fastify: FastifyInstance) {
  fastify.route({
    method: 'GET',
    url: '/:customerId/transactions',
    schema: {
      params: AggregatedTransactionRequestShema,
      response: {
        200: AggregatedTransactionsResponseShema,
      },
    },
    handler: transactionsHandler(fastify.transactionDB),
  });

  fastify.route({
    method: 'GET',
    url: '/:customerId/related-customers',
    schema: {
      params: RelatedCustomersRequestShema,
      response: {
        200: RelatedCustomersResponseShema,
      },
    },
    handler: relatedCustomersHandler(fastify.transactionDB),
  });
}
