import dayjs from 'dayjs'
import { db } from '../lib/db'

export async function expenseTransactions(teamId: string) {
  const today = dayjs()
  const lastMonth = today.subtract(1, 'month')
  const startOfLastMonth = lastMonth.startOf('month')

  const lastMonthWithYear = lastMonth.format('YYYY-MM')
  const currentMonthWithYear = today.format('YYYY-MM')

  const transactions = await db.transaction.findMany({
    select: {
      created_at: true,
      amount_in_cents: true,
    },
    where: {
      team_id: teamId,
      type: 'EXPENSE',
      created_at: {
        gte: startOfLastMonth.toDate(),
      },
    },
  })

  const expenseTransactions = transactions.reduce((acc, transaction) => {
    const monthWithYear = dayjs(transaction.created_at).format('YYYY-MM')

    if (!acc[monthWithYear]) {
      acc[monthWithYear] = 0
    }

    acc[monthWithYear] += transaction.amount_in_cents

    return acc
  }, {} as Record<string, number>)

  const filteredTransactions = Object.entries(expenseTransactions)
    .filter(([, expense]) => expense >= 1)
    .map(([monthWithYear, expense]) => ({
      monthWithYear,
      expense,
    }))

  const currentExpenseTransactions = filteredTransactions.find(
    (expenseTransactions) => expenseTransactions.monthWithYear === currentMonthWithYear
  )

  const lastExpenseTransactions = filteredTransactions.find(
    (expenseTransactions) => expenseTransactions.monthWithYear === lastMonthWithYear
  )

  const diffFromLastMonth =
    lastExpenseTransactions && currentExpenseTransactions
      ? (currentExpenseTransactions.expense * 100) / lastExpenseTransactions.expense
      : null;

  return {
    transactions: currentExpenseTransactions?.expense ?? 0,
    diffFromLastMonth: diffFromLastMonth
      ? Number((diffFromLastMonth - 100).toFixed(2))
      : 0,
  }
}