import { FastifyRequest, FastifyReply } from 'fastify';
import { RelatedCustomersRequestType, RelatedCustomerType, RelationTypeDict } from './dto';
import { TransactionRepository } from '../../../models/transaction';

export const relatedCustomersHandler =
  (transactionDB: TransactionRepository) =>
  async (
    request: FastifyRequest<{
      Reply: { relatedCustomers: RelatedCustomerType[] };
      Params: RelatedCustomersRequestType;
    }>,
    reply: FastifyReply,
  ) => {
    const { customerId } = request.params;
    const allTransactions = transactionDB.findByCustomerId(customerId);
    const relatedCustomers: RelatedCustomerType[] = [];
    const deviceIds = new Set<string>();

    allTransactions.forEach((t) => {
      if (t.metadata.deviceId != null) {
        deviceIds.add(t.metadata.deviceId);
      }

      if (
        (t.transactionType === RelationTypeDict.P2P_SEND || t.transactionType === RelationTypeDict.P2P_RECEIVE) &&
        t.metadata.relatedTransactionId != null
      ) {
        const relatedTransaction = transactionDB.findById(t.metadata.relatedTransactionId);

        if (relatedTransaction) {
          relatedCustomers.push({
            relationType: t.transactionType,
            relatedCustomerId: relatedTransaction.customerId,
          });
        }
      }
    }, [] as RelatedCustomerType[]);

    deviceIds.forEach((id) => {
      const sameDeviceTransactions = transactionDB.findByDeviceId(id);
      sameDeviceTransactions.forEach((t) => {
        if (t.customerId !== customerId) {
          relatedCustomers.push({ relationType: RelationTypeDict.DEVICE, relatedCustomerId: t.customerId });
        }
      });
    });

    return { relatedCustomers };
  };
