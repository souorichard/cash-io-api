import dayjs from 'dayjs'
import { db } from '../lib/db'

export async function revenueTransactions(teamId: string) {
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
      type: 'REVENUE',
      created_at: {
        gte: startOfLastMonth.toDate(),
      },
    },
  })

  const revenueTransactions = transactions.reduce((acc, transaction) => {
    const monthWithYear = dayjs(transaction.created_at).format('YYYY-MM')

    if (!acc[monthWithYear]) {
      acc[monthWithYear] = 0
    }

    acc[monthWithYear] += transaction.amount_in_cents

    return acc
  }, {} as Record<string, number>)

  const filteredTransactions = Object.entries(revenueTransactions)
    .filter(([, revenue]) => revenue >= 1)
    .map(([monthWithYear, revenue]) => ({
      monthWithYear,
      revenue,
    }))

  const currentRevenueTransactions = filteredTransactions.find(
    (revenueTransactions) => revenueTransactions.monthWithYear === currentMonthWithYear
  )

  const lastRevenueTransactions = filteredTransactions.find(
    (revenueTransactions) => revenueTransactions.monthWithYear === lastMonthWithYear
  )

  const diffFromLastMonth =
    lastRevenueTransactions && currentRevenueTransactions
      ? (currentRevenueTransactions.revenue * 100) / lastRevenueTransactions.revenue
      : null;

  return {
    transactions: currentRevenueTransactions?.revenue ?? 0,
    diffFromLastMonth: diffFromLastMonth
      ? Number((diffFromLastMonth - 100).toFixed(2))
      : 0,
  }
}