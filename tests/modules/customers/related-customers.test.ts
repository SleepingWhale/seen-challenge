import { it, describe, TestContext, beforeEach, afterEach, mock } from 'node:test';
import { FastifyInstance } from 'fastify';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

import { TransactionDAOType } from '../../../src/models/transaction';
import { build } from '../../../src/app';
import {
  RelatedCustomersResponseShema,
  RelatedCustomerType,
  RelationTypeDict,
} from '../../../src/modules/customers/related-customers/dto';

const ajv = new Ajv({ allErrors: true, useDefaults: true });
addFormats(ajv);
const validateRelatedCustomersResponse = ajv.compile(RelatedCustomersResponseShema);
// @ts-ignore
const toSet = (arr: any) => new Set(arr.map((e) => JSON.stringify(e)));

// c3_c4_P2P_SEND - between customerId 3 and customerId 4
const c3_c4_P2P_SEND: TransactionDAOType = {
  transactionId: 15,
  authorizationCode: 'F10007',
  transactionDate: '2022-09-06T11:05:00+00:00',
  customerId: 3,
  transactionType: 'P2P_SEND',
  transactionStatus: 'SETTLED',
  description: 'Transfer to Adam',
  amount: -10000,
  metadata: {
    relatedTransactionId: 16,
  },
};

const c4_c3_P2P_RECEIVE: TransactionDAOType = {
  transactionId: 16,
  authorizationCode: 'F10007',
  transactionDate: '2022-09-06T11:05:00+00:00',
  customerId: 4,
  transactionType: 'P2P_RECEIVE',
  transactionStatus: 'SETTLED',
  description: 'Transfer from Frederik',
  amount: 10000,
  metadata: {
    relatedTransactionId: 15,
  },
};

const c3_Unrelated: TransactionDAOType = {
  transactionId: 1,
  authorizationCode: 'F10000',
  transactionDate: '2022-09-01T11:46:42+00:00',
  customerId: 3,
  transactionType: 'ACH_INCOMING',
  transactionStatus: 'PENDING',
  description: 'Deposit from Citibank',
  amount: 5000,
  metadata: {},
};

const c4_c6_DEVICE: TransactionDAOType = {
  transactionId: 17,
  authorizationCode: 'F10008',
  transactionDate: '2022-09-06T13:05:00+00:00',
  customerId: 4,
  transactionType: 'P2P_SEND',
  transactionStatus: 'SETTLED',
  description: 'Transfer to Weoy',
  amount: -10000,
  metadata: {
    relatedTransactionId: 18,
    deviceId: 'F210200',
  },
};

const c6_c4_DEVICE: TransactionDAOType = {
  transactionId: 21,
  authorizationCode: 'F10010',
  transactionDate: '2022-09-09T11:05:00+00:00',
  customerId: 6,
  transactionType: 'P2P_SEND',
  transactionStatus: 'SETTLED',
  description: 'Transfer to Joseph',
  amount: -3000,
  metadata: {
    relatedTransactionId: 22,
    deviceId: 'F210200',
  },
};

const c1_Unrelated: TransactionDAOType = {
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

describe('GET `/api/v1/customers/:customerId/related-customers` route', () => {
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

  it('returns a single P2P_SEND related customer', async (t: TestContext) => {
    t.plan(4);
    const customerId = 3;

    data = [c3_c4_P2P_SEND, c4_c3_P2P_RECEIVE, c3_Unrelated];

    const response = await fastify.inject({
      method: 'GET',
      url: `/api/v1/customers/${customerId}/related-customers`,
    });
    const payload: { relatedCustomers: RelatedCustomerType[] } = response.json();
    const actual = payload.relatedCustomers;

    const expected = [
      {
        relationType: RelationTypeDict.P2P_SEND,
        relatedCustomerId: c4_c3_P2P_RECEIVE.customerId,
      },
    ];

    t.assert.deepStrictEqual(toSet(actual), toSet(expected));

    t.assert.equal(response.statusCode, 200, 'Response status should be 200');
    t.assert.equal(response.headers['content-type'], 'application/json; charset=utf-8', 'Content-Type should match');
    t.assert.ok(validateRelatedCustomersResponse(payload), 'Response payload should correspond to schema');
  });

  it('returns a single P2P_RECEIVE related customer', async (t: TestContext) => {
    t.plan(4);
    const customerId = 4;

    data = [c3_c4_P2P_SEND, c4_c3_P2P_RECEIVE, c3_Unrelated];

    const response = await fastify.inject({
      method: 'GET',
      url: `/api/v1/customers/${customerId}/related-customers`,
    });
    const payload: { relatedCustomers: RelatedCustomerType[] } = response.json();
    const actual = payload.relatedCustomers;

    const expected = [
      {
        relationType: RelationTypeDict.P2P_RECEIVE,
        relatedCustomerId: c3_c4_P2P_SEND.customerId,
      },
    ];

    t.assert.deepStrictEqual(toSet(actual), toSet(expected));

    t.assert.equal(response.statusCode, 200, 'Response status should be 200');
    t.assert.equal(response.headers['content-type'], 'application/json; charset=utf-8', 'Content-Type should match');
    t.assert.ok(validateRelatedCustomersResponse(payload), 'Response payload should correspond to schema');
  });

  it('returns a single DEVICE related customer', async (t: TestContext) => {
    t.plan(4);
    const customerId = 4;

    data = [c4_c6_DEVICE, c6_c4_DEVICE, c3_Unrelated];

    const response = await fastify.inject({
      method: 'GET',
      url: `/api/v1/customers/${customerId}/related-customers`,
    });
    const payload: { relatedCustomers: RelatedCustomerType[] } = response.json();
    const actual = payload.relatedCustomers;

    const expected = [
      {
        relationType: RelationTypeDict.DEVICE,
        relatedCustomerId: c6_c4_DEVICE.customerId,
      },
    ];

    t.assert.deepStrictEqual(toSet(actual), toSet(expected));

    t.assert.equal(response.statusCode, 200, 'Response status should be 200');
    t.assert.equal(response.headers['content-type'], 'application/json; charset=utf-8', 'Content-Type should match');
    t.assert.ok(validateRelatedCustomersResponse(payload), 'Response payload should correspond to schema');
  });

  it('returns 2 related customers: DEVICE, P2P_RECEIVE', async (t: TestContext) => {
    t.plan(4);
    const customerId = 4;

    data = [c4_c6_DEVICE, c6_c4_DEVICE, c3_c4_P2P_SEND, c4_c3_P2P_RECEIVE, c3_Unrelated];

    const response = await fastify.inject({
      method: 'GET',
      url: `/api/v1/customers/${customerId}/related-customers`,
    });
    const payload: { relatedCustomers: RelatedCustomerType[] } = response.json();
    const actual = payload.relatedCustomers;

    const expected = [
      {
        relationType: RelationTypeDict.DEVICE,
        relatedCustomerId: c6_c4_DEVICE.customerId,
      },
      {
        relationType: RelationTypeDict.P2P_RECEIVE,
        relatedCustomerId: c3_c4_P2P_SEND.customerId,
      },
    ];

    t.assert.deepStrictEqual(toSet(actual), toSet(expected));

    t.assert.equal(response.statusCode, 200, 'Response status should be 200');
    t.assert.equal(response.headers['content-type'], 'application/json; charset=utf-8', 'Content-Type should match');
    t.assert.ok(validateRelatedCustomersResponse(payload), 'Response payload should correspond to schema');
  });

  it('returns 0 related customers for a customer without P2P transactions', async (t: TestContext) => {
    t.plan(4);
    const customerId = 1;

    data = [c4_c6_DEVICE, c6_c4_DEVICE, c3_c4_P2P_SEND, c4_c3_P2P_RECEIVE, c3_Unrelated, c1_Unrelated];

    const response = await fastify.inject({
      method: 'GET',
      url: `/api/v1/customers/${customerId}/related-customers`,
    });
    const payload: { relatedCustomers: RelatedCustomerType[] } = response.json();

    t.assert.equal(payload.relatedCustomers.length, 0);

    t.assert.equal(response.statusCode, 200, 'Response status should be 200');
    t.assert.equal(response.headers['content-type'], 'application/json; charset=utf-8', 'Content-Type should match');
    t.assert.ok(validateRelatedCustomersResponse(payload), 'Response payload should correspond to schema');
  });

  it('returns 0 related customers for a customer without transactions', async (t: TestContext) => {
    t.plan(4);
    const customerId = 111;

    data = [c4_c6_DEVICE, c6_c4_DEVICE, c3_c4_P2P_SEND, c4_c3_P2P_RECEIVE, c3_Unrelated, c1_Unrelated];

    const response = await fastify.inject({
      method: 'GET',
      url: `/api/v1/customers/${customerId}/related-customers`,
    });
    const payload: { relatedCustomers: RelatedCustomerType[] } = response.json();

    t.assert.equal(payload.relatedCustomers.length, 0);

    t.assert.equal(response.statusCode, 200, 'Response status should be 200');
    t.assert.equal(response.headers['content-type'], 'application/json; charset=utf-8', 'Content-Type should match');
    t.assert.ok(validateRelatedCustomersResponse(payload), 'Response payload should correspond to schema');
  });
});
