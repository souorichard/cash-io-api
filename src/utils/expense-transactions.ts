import { db } from "../lib/db";

export async function expenseTransactions(id: string) {
  const transactions = await db.transaction.findMany({
    where: {
      createdById: id,
      type: 'EXPENSE'
    }
  })

  let expenseTransactions = 0

  for (let i = 0; i < transactions.length; i++) {
    expenseTransactions += transactions[i].amount  
  }

  return expenseTransactions
}