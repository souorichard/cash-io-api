import { db } from "../lib/db";

export async function revenueTransactions(id: string) {
  const transactions = await db.transaction.findMany({
    where: {
      createdById: id,
      type: 'REVENUE'
    }
  })

  let revenueTransactions = 0

  for (let i = 0; i < transactions.length; i++) {
    revenueTransactions += transactions[i].amount  
  }

  return revenueTransactions
}