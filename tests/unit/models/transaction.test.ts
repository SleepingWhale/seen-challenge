import { TransactionDAOType, TransactionRepository } from '../../../src/models/transaction';
import assert from 'node:assert';
import { describe, it } from 'node:test';

const t1: TransactionDAOType = {
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
const t2: TransactionDAOType = {
  transactionId: 2,
  authorizationCode: 'F10000',
  transactionDate: '2022-09-03T15:41:42+00:00',
  customerId: 1,
  transactionType: 'ACH_INCOMING',
  transactionStatus: 'SETTLED',
  description: 'Deposit from Citibank',
  amount: 5000,
  metadata: {
    relatedTransactionId: 1,
  },
};
const t3: TransactionDAOType = {
  transactionId: 3,
  authorizationCode: 'F10001',
  transactionDate: '2022-09-05T11:36:42+00:00',
  customerId: 2,
  transactionType: 'POS',
  transactionStatus: 'PENDING',
  description: 'Amazon',
  amount: -143.21,
  metadata: {},
};
const t4: TransactionDAOType = {
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

const sampleData: TransactionDAOType[] = [t1, t2, t3, t4];

describe('findByCustomerId()', () => {
  it('finds transactions with customerId === 1', () => {
    const transactionDB = new TransactionRepository(sampleData);

    const actual = transactionDB.findByCustomerId(1);
    const expected = [t1, t2];

    assert.deepEqual(actual, expected);
  });

  it('finds no transactions with customerId === 3', () => {
    const transactionDB = new TransactionRepository(sampleData);

    const actual = transactionDB.findByCustomerId(3);

    assert.equal(actual.length, 0);
  });
});

describe('findById()', () => {
  it('finds transactions with transactionId === 1', () => {
    const transactionDB = new TransactionRepository(sampleData);

    const actual = transactionDB.findById(1);
    const expected = t1;

    assert.deepEqual(actual, expected);
  });

  it('finds no transactions with transactionId === 4', () => {
    const transactionDB = new TransactionRepository(sampleData);

    const actual = transactionDB.findById(4);

    assert.ifError(actual);
  });
});

describe('findByDeviceId()', () => {
  it('finds transactions with deviceId === F210200', () => {
    const transactionDB = new TransactionRepository(sampleData);

    const actual = transactionDB.findByDeviceId('F210200');
    const expected = [t4];

    assert.deepEqual(actual, expected);
  });

  it('finds no transactions with deviceId === F210201', () => {
    const transactionDB = new TransactionRepository(sampleData);

    const actual = transactionDB.findByDeviceId('F210201');

    assert.equal(actual.length, 0);
  });
});
