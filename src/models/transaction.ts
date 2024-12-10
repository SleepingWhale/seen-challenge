import fp from 'fastify-plugin';
import { Static, Type } from '@sinclair/typebox';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { FastifyInstance } from 'fastify';

export const TransactionTypeEnum = Type.Union([
  Type.Literal('ACH_INCOMING'),
  Type.Literal('POS'),
  Type.Literal('WIRE_OUTGOING'),
  Type.Literal('WIRE_INCOMING'),
  Type.Literal('P2P_SEND'),
  Type.Literal('P2P_RECEIVE'),
  Type.Literal('FEE'),
]);

export const TransactionStatusEnum = Type.Union([
  Type.Literal('PENDING'),
  Type.Literal('SETTLED'),
  Type.Literal('RETURNED'),
  Type.Literal('PROCESSING'),
]);

export const TransactionMetadata = Type.Object({
  relatedTransactionId: Type.Optional(Type.Integer()),
  deviceId: Type.Optional(Type.String()),
});

const TransactionDAOSchema = Type.Object({
  transactionId: Type.Integer(),
  authorizationCode: Type.String(),
  transactionDate: Type.String({ format: 'date-time' }),
  customerId: Type.Integer(),
  transactionType: TransactionTypeEnum,
  transactionStatus: TransactionStatusEnum,
  description: Type.String(),
  amount: Type.Number(),
  metadata: TransactionMetadata,
});

export type TransactionDAOType = Static<typeof TransactionDAOSchema>;

const ajv = new Ajv({ allErrors: true, useDefaults: true });
addFormats(ajv);

const validateTransactions = ajv.compile(Type.Array(TransactionDAOSchema));

export class TransactionRepository {
  private transactions: TransactionDAOType[] = [];

  constructor(data: TransactionDAOType[]) {
    if (!validateTransactions(data)) {
      throw new Error(`Invalid data: ${ajv.errorsText(validateTransactions.errors)}`);
    }
    this.transactions = data;
  }

  static async create() {
    const response = await fetch('https://cdn.seen.com/challenge/transactions-v2.json');
    const data = (await response.json()) as TransactionDAOType[];
    return new TransactionRepository(data);
  }

  findByCustomerId(customerId: number): TransactionDAOType[] {
    return this.transactions.filter((t) => t.customerId === customerId);
  }

  findByDeviceId(deviceId: string): TransactionDAOType[] {
    return this.transactions.filter((t) => t.metadata.deviceId === deviceId);
  }

  findById(transactionId: number): TransactionDAOType | undefined {
    return this.transactions.find((t) => t.transactionId === transactionId);
  }
}

export const transactionDBPlugin = fp(async (fastify: FastifyInstance) => {
  const transactionDB = await TransactionRepository.create();

  fastify.decorate('transactionDB', transactionDB);
});
