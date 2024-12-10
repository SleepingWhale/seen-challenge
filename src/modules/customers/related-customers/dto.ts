import { Static, Type } from '@sinclair/typebox';

const RelationTypeEnum = Type.Union([Type.Literal('P2P_SEND'), Type.Literal('P2P_RECEIVE'), Type.Literal('DEVICE')]);

export type RelationType = Static<typeof RelationTypeEnum>;

export const RelationTypeDict: Record<RelationType, RelationType> = {
  P2P_SEND: 'P2P_SEND',
  P2P_RECEIVE: 'P2P_RECEIVE',
  DEVICE: 'DEVICE',
};

const RelatedCustomerShema = Type.Object({
  relationType: RelationTypeEnum,
  relatedCustomerId: Type.Integer(),
});

export const RelatedCustomersResponseShema = Type.Object({
  relatedCustomers: Type.Array(RelatedCustomerShema),
});

export type RelatedCustomerType = Static<typeof RelatedCustomerShema>;

export const RelatedCustomersRequestShema = Type.Object(
  {
    customerId: Type.Integer({ minimum: 1 }),
  },
  { additionalProperties: false },
);

export type RelatedCustomersRequestType = Static<typeof RelatedCustomersRequestShema>;
