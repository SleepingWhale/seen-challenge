import { it, describe, TestContext, beforeEach, afterEach, mock } from 'node:test';
import { FastifyInstance } from 'fastify';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

import { TransactionDAOType } from '../../../src/models/transaction';
import { build } from '../../../src/app';
import {
  AggregatedTransactionType,
  AggregatedTransactionsResponseShema,
} from '../../../src/modules/customers/transactions/dto';

const ajv = new Ajv({ allErrors: true, useDefaults: true });
addFormats(ajv);
const validateAggregatedTransactionsResponse = ajv.compile(AggregatedTransactionsResponseShema);

// c1a1t1 - customer 1, authorisation 1, transaction 1
const c1a1t1: TransactionDAOType = {
  transactionId: 3,
  authorizationCode: 'F10001',
  transactionDate: '2022-09-05T11:36:42+00:00',
  customerId: 1,
  transactionType: 'POS',
  transactionStatus: 'PENDING',
  description: 'Amazon',
  amount: -143.21,
  metadata: {},
};
const c1a1t2: TransactionDAOType = {
  transactionId: 4,
  authorizationCode: 'F10001',
  transactionDate: '2022-09-06T15:41:42+00:00',
  customerId: 1,
  transactionType: 'POS',
  transactionStatus: 'SETTLED',
  description: 'Amazon',
  amount: -143.21,
  metadata: {
    relatedTransactionId: 3,
  },
};
const c1a1t3: TransactionDAOType = {
  transactionId: 8,
  authorizationCode: 'F10001',
  transactionDate: '2022-09-10T15:41:42+00:00',
  customerId: 1,
  transactionType: 'POS',
  transactionStatus: 'RETURNED',
  description: 'Amazon',
  amount: 143.21,
  metadata: {
    relatedTransactionId: 4,
  },
};

const c1a2t1: TransactionDAOType = {
  transactionId: 1,
  authorizationCode: 'F10000',
  transactionDate: '2022-09-01T11:46:42+00:00',
  customerId: 1,
  transactionType: 'ACH_INCOMING',
  transactionStatus: 'PENDING',
  description: 'Deposit from Citibank',
  amount: 5000,
  metadata: {},
};

const c2a1t1: TransactionDAOType = {
  transactionId: 9,
  authorizationCode: 'F10004',
  transactionDate: '2022-09-02T00:35:00+00:00',
  customerId: 2,
  transactionType: 'ACH_INCOMING',
  transactionStatus: 'PENDING',
  description: 'Deposit from Chime',
  amount: 3000,
  metadata: {},
};

describe('GET `/api/v1/customers/:customerId/transactions` route', () => {
  let fastify: FastifyInstance;
  let data: TransactionDAOType[];

  beforeEach(() => {
    const mockFetch = async () => ({
      json: async () => data,
      status: 200,
    });

    mock.method(global, 'fetch', mockFetch);

    fastify = build();
  });

  afterEach(() => fastify.close());

  it('returns a single aggreagated transaction with a single event', async (t: TestContext) => {
    t.plan(14);

    data = [c1a1t1];

    const response = await fastify.inject({
      method: 'GET',
      url: '/api/v1/customers/1/transactions',
    });
    const payload: { transactions: AggregatedTransactionType[] } = response.json();
    const aggreagatedTransaction1 = payload.transactions[0];

    t.assert.equal(aggreagatedTransaction1.createdAt, c1a1t1.transactionDate);
    t.assert.equal(aggreagatedTransaction1.updatedAt, c1a1t1.transactionDate);
    t.assert.equal(aggreagatedTransaction1.authorizationCode, c1a1t1.authorizationCode);
    t.assert.equal(aggreagatedTransaction1.transactionId, c1a1t1.transactionId);
    t.assert.equal(aggreagatedTransaction1.status, c1a1t1.transactionStatus);
    t.assert.equal(aggreagatedTransaction1.description, c1a1t1.description);
    t.assert.equal(aggreagatedTransaction1.transactionType, c1a1t1.transactionType);
    t.assert.deepEqual(aggreagatedTransaction1.metadata, c1a1t1.metadata);
    t.assert.equal(aggreagatedTransaction1.timeline[0].createdAt, c1a1t1.transactionDate);
    t.assert.equal(aggreagatedTransaction1.timeline[0].status, c1a1t1.transactionStatus);
    t.assert.equal(aggreagatedTransaction1.timeline[0].amount, c1a1t1.amount);

    t.assert.equal(response.statusCode, 200, 'Response status should be 200');
    t.assert.equal(response.headers['content-type'], 'application/json; charset=utf-8', 'Content-Type should match');
    t.assert.ok(validateAggregatedTransactionsResponse(payload), 'Response payload should correspond to schema');
  });

  it('returns a single aggreagated transaction with 2 events', async (t: TestContext) => {
    t.plan(17);

    data = [c1a1t1, c1a1t2];

    const response = await fastify.inject({
      method: 'GET',
      url: '/api/v1/customers/1/transactions',
    });
    const payload: { transactions: AggregatedTransactionType[] } = response.json();
    const aggreagatedTransaction1 = payload.transactions[0];

    t.assert.equal(aggreagatedTransaction1.createdAt, c1a1t1.transactionDate);
    t.assert.equal(aggreagatedTransaction1.updatedAt, c1a1t2.transactionDate);
    t.assert.equal(aggreagatedTransaction1.authorizationCode, c1a1t1.authorizationCode);
    t.assert.equal(aggreagatedTransaction1.transactionId, c1a1t1.transactionId);
    t.assert.equal(aggreagatedTransaction1.status, c1a1t2.transactionStatus);
    t.assert.equal(aggreagatedTransaction1.description, c1a1t1.description);
    t.assert.equal(aggreagatedTransaction1.transactionType, c1a1t1.transactionType);
    t.assert.deepEqual(aggreagatedTransaction1.metadata, c1a1t1.metadata);
    t.assert.equal(aggreagatedTransaction1.timeline[0].createdAt, c1a1t1.transactionDate);
    t.assert.equal(aggreagatedTransaction1.timeline[0].status, c1a1t1.transactionStatus);
    t.assert.equal(aggreagatedTransaction1.timeline[0].amount, c1a1t1.amount);
    t.assert.equal(aggreagatedTransaction1.timeline[1].createdAt, c1a1t2.transactionDate);
    t.assert.equal(aggreagatedTransaction1.timeline[1].status, c1a1t2.transactionStatus);
    t.assert.equal(aggreagatedTransaction1.timeline[1].amount, c1a1t2.amount);

    t.assert.equal(response.statusCode, 200, 'Response status should be 200');
    t.assert.equal(response.headers['content-type'], 'application/json; charset=utf-8', 'Content-Type should match');
    t.assert.ok(validateAggregatedTransactionsResponse(payload), 'Response payload should correspond to schema');
  });

  it('returns a single aggreagated transaction with 3 events', async (t: TestContext) => {
    t.plan(20);

    data = [c1a1t1, c1a1t2, c1a1t3];

    const response = await fastify.inject({
      method: 'GET',
      url: '/api/v1/customers/1/transactions',
    });
    const payload: { transactions: AggregatedTransactionType[] } = response.json();
    const aggreagatedTransaction1 = payload.transactions[0];

    t.assert.equal(aggreagatedTransaction1.createdAt, c1a1t1.transactionDate);
    t.assert.equal(aggreagatedTransaction1.updatedAt, c1a1t3.transactionDate);
    t.assert.equal(aggreagatedTransaction1.authorizationCode, c1a1t1.authorizationCode);
    t.assert.equal(aggreagatedTransaction1.transactionId, c1a1t1.transactionId);
    t.assert.equal(aggreagatedTransaction1.status, c1a1t3.transactionStatus);
    t.assert.equal(aggreagatedTransaction1.description, c1a1t1.description);
    t.assert.equal(aggreagatedTransaction1.transactionType, c1a1t1.transactionType);
    t.assert.deepEqual(aggreagatedTransaction1.metadata, c1a1t1.metadata);
    t.assert.equal(aggreagatedTransaction1.timeline[0].createdAt, c1a1t1.transactionDate);
    t.assert.equal(aggreagatedTransaction1.timeline[0].status, c1a1t1.transactionStatus);
    t.assert.equal(aggreagatedTransaction1.timeline[0].amount, c1a1t1.amount);
    t.assert.equal(aggreagatedTransaction1.timeline[1].createdAt, c1a1t2.transactionDate);
    t.assert.equal(aggreagatedTransaction1.timeline[1].status, c1a1t2.transactionStatus);
    t.assert.equal(aggreagatedTransaction1.timeline[1].amount, c1a1t2.amount);
    t.assert.equal(aggreagatedTransaction1.timeline[2].createdAt, c1a1t3.transactionDate);
    t.assert.equal(aggreagatedTransaction1.timeline[2].status, c1a1t3.transactionStatus);
    t.assert.equal(aggreagatedTransaction1.timeline[2].amount, c1a1t3.amount);

    t.assert.equal(response.statusCode, 200, 'Response status should be 200');
    t.assert.equal(response.headers['content-type'], 'application/json; charset=utf-8', 'Content-Type should match');
    t.assert.ok(validateAggregatedTransactionsResponse(payload), 'Response payload should correspond to schema');
  });

  it('returns 2 aggreagated transaction', async (t: TestContext) => {
    t.plan(6);

    data = [c1a1t1, c1a1t2, c1a1t3, c1a2t1];

    const response = await fastify.inject({
      method: 'GET',
      url: '/api/v1/customers/1/transactions',
    });
    const payload: { transactions: AggregatedTransactionType[] } = response.json();
    const aggreagatedTransaction1 = payload.transactions[0];
    const aggreagatedTransaction2 = payload.transactions[1];

    t.assert.equal(payload.transactions.length, 2);
    t.assert.equal(aggreagatedTransaction1.transactionId, c1a2t1.transactionId);
    t.assert.equal(aggreagatedTransaction2.transactionId, c1a1t1.transactionId);

    t.assert.equal(response.statusCode, 200, 'Response status should be 200');
    t.assert.equal(response.headers['content-type'], 'application/json; charset=utf-8', 'Content-Type should match');
    t.assert.ok(validateAggregatedTransactionsResponse(payload), 'Response payload should correspond to schema');
  });

  it('returns only aggregated transactions belonging to customerId === 2', async (t: TestContext) => {
    t.plan(5);

    data = [c1a1t1, c1a1t2, c1a1t3, c1a2t1, c2a1t1];
    const customerId = 2;

    const response = await fastify.inject({
      method: 'GET',
      url: `/api/v1/customers/${customerId}/transactions`,
    });
    const payload: { transactions: AggregatedTransactionType[] } = response.json();
    const aggreagatedTransaction1 = payload.transactions[0];

    t.assert.equal(payload.transactions.length, 1);
    t.assert.equal(aggreagatedTransaction1.transactionId, c2a1t1.transactionId);

    t.assert.equal(response.statusCode, 200, 'Response status should be 200');
    t.assert.equal(response.headers['content-type'], 'application/json; charset=utf-8', 'Content-Type should match');
    t.assert.ok(validateAggregatedTransactionsResponse(payload), 'Response payload should correspond to schema');
  });

  it('returns no aggregated transactions for a user without transactions', async (t: TestContext) => {
    t.plan(4);

    data = [c1a1t1, c1a1t2, c1a1t3, c1a2t1, c2a1t1];
    const customerId = 3;

    const response = await fastify.inject({
      method: 'GET',
      url: `/api/v1/customers/${customerId}/transactions`,
    });
    const payload: { transactions: AggregatedTransactionType[] } = response.json();

    t.assert.equal(payload.transactions.length, 0);

    t.assert.equal(response.statusCode, 200, 'Response status should be 200');
    t.assert.equal(response.headers['content-type'], 'application/json; charset=utf-8', 'Content-Type should match');
    t.assert.ok(validateAggregatedTransactionsResponse(payload), 'Response payload should correspond to schema');
  });
});
