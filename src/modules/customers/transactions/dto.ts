import { Static, Type } from '@sinclair/typebox';
import { TransactionMetadata, TransactionStatusEnum, TransactionTypeEnum } from '../../../models/transaction';

const TimelineEntry = Type.Object({
  createdAt: Type.String({ format: 'date-time' }),
  status: TransactionStatusEnum,
  amount: Type.Number(),
});

const AggregatedTransactionShema = Type.Object({
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
  transactionId: Type.Integer(),
  authorizationCode: Type.String(),
  status: TransactionStatusEnum,
  description: Type.String(),
  transactionType: TransactionTypeEnum,
  metadata: TransactionMetadata,
  timeline: Type.Array(TimelineEntry),
});

export const AggregatedTransactionsResponseShema = Type.Object({
  transactions: Type.Array(AggregatedTransactionShema),
});

export type AggregatedTransactionType = Static<typeof AggregatedTransactionShema>;

export const AggregatedTransactionRequestShema = Type.Object(
  {
    customerId: Type.Integer({ minimum: 1 }),
  },
  { additionalProperties: false },
);

export type AggregatedTransactionRequestType = Static<typeof AggregatedTransactionRequestShema>;
