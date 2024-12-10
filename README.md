# Coding Challenge

## Overview
This is a simple **Node.js** and **TypeScript** application that exposes two endpoints for transaction data and related customers. The APIs aggregate and enrich the transaction data provided.

## Endpoints

### 1. Customer Transactions
- **Method**: GET  
- **URL**: `/api/v1/customers/:customerId/transactions`  
- **Purpose**:  
  - Retrieves aggregated transactions for a customer.  
  - Combines transaction phases (e.g., `PROCESSING` → `SETTLED`) into one entry with a detailed timeline.  

#### Example Response
```json
{
  "transactions": [
    {
      "transactionId": 1,
      "status": "SETTLED",
      "description": "Amazon.com",
      "transactionType": "POS",
      "timeline": [
        { "createdAt": "2022-09-01T11:46:42+00:00", "status": "PROCESSING", "amount": 5000.00 },
        { "createdAt": "2022-09-03T15:41:42+00:00", "status": "SETTLED", "amount": 5000.00 }
      ]
    }
  ]
}
```

### 2. Related Customers
- **Method**: GET  
- **URL**: `/api/v1/customers/:customerId/related-customers`  
- **Purpose**:  
  - Fetches customers related to the given `customerId` based on device usage or peer-to-peer transactions.  

#### Example Response
```json
{
  "relatedCustomers": [
    { "relatedCustomerId": 3, "relationType": "P2P_SEND" },
    { "relatedCustomerId": 5, "relationType": "P2P_RECEIVE" },
    { "relatedCustomerId": 3, "relationType": "DEVICE" }
  ]
}
```

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run the Application**
   ```bash
   npm start
   ```

3. **Run Tests**
   ```bash
   npm test
   ```

4. **Build**
   ```bash
   npm run build
   ```

## Notes

### Assumptions
- Database access is abstracted with `TransactionRepository`
- User-facing endpoint handler naively uses `customerId` from the URL param. Normally we would get it from JWT or session token in headers or cookies.

### Out of scope
- Logging
- Authentication/Authorisation
- Rate limiting

### Personal objectives
- Try out Node.js native test runner
- Try out typebox
