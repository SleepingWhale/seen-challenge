import { FastifyInstance } from 'fastify';
import { customersRoutes } from './customers';

export const routes = async (fastify: FastifyInstance) => {
  fastify.register(customersRoutes, { prefix: '/api/v1/customers/' });
};
