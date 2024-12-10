import { FastifyRequest, FastifyReply } from 'fastify';
import { AggregatedTransactionRequestType, AggregatedTransactionType } from './dto';
import { TransactionRepository, TransactionDAOType } from '../../../models/transaction';

export const transactionsHandler =
  (transactionDB: TransactionRepository) =>
  async (
    request: FastifyRequest<{
      Reply: { transactions: AggregatedTransactionType[] };
      Params: AggregatedTransactionRequestType;
    }>,
    reply: FastifyReply,
  ) => {
    const { customerId } = request.params;
    const allTransactions = transactionDB.findByCustomerId(customerId);
    const groupedTransactions = new Map<string, TransactionDAOType[]>();
    const aggregatedTransactions: AggregatedTransactionType[] = [];

    allTransactions.forEach((t) => {
      if (groupedTransactions.has(t.authorizationCode)) {
        groupedTransactions.set(t.authorizationCode, [...groupedTransactions.get(t.authorizationCode)!, t]);
      } else {
        groupedTransactions.set(t.authorizationCode, [t]);
      }
    });

    for (let [_, group] of groupedTransactions) {
      const initTransactionIndex = group.findIndex((t) => t.metadata.relatedTransactionId == null);
      const sourtedGroup: TransactionDAOType[] = group.splice(initTransactionIndex, 1);

      while (group.length > 0) {
        const previousTransactionId = sourtedGroup[0].transactionId;
        const nextTransactionIndex = group.findIndex((t) => t.metadata.relatedTransactionId === previousTransactionId);
        sourtedGroup.push(group.splice(nextTransactionIndex, 1)[0]);
      }

      aggregatedTransactions.push(
        sourtedGroup.reduce<AggregatedTransactionType>((acc, t, i, arr) => {
          if (i === 0) {
            acc.createdAt = t.transactionDate;
            acc.transactionId = t.transactionId;
            acc.authorizationCode = t.authorizationCode;
            acc.transactionType = t.transactionType;
            acc.metadata = t.metadata;
            acc.timeline = [];
          }

          if (i === arr.length - 1) {
            acc.updatedAt = t.transactionDate;
            acc.status = t.transactionStatus;
            acc.description = t.description;
          }

          acc.timeline.push({
            createdAt: t.transactionDate,
            status: t.transactionStatus,
            amount: t.amount,
          });

          return acc;
        }, {} as AggregatedTransactionType),
      );
    }

    aggregatedTransactions.sort((t1, t2) => new Date(t1.createdAt).getTime() - new Date(t2.createdAt).getTime());

    return { transactions: aggregatedTransactions };
  };
