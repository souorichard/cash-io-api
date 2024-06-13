import fastify from 'fastify'
import cors from '@fastify/cors'
import { signUp } from './routes/auth/sign-up'
import { signIn } from './routes/auth/sign-in'
import { getTransactions } from './routes/transaction/get-transactions'
import { addTransaction } from './routes/transaction/add-transaction'
import { updateTransaction } from './routes/transaction/update-transaction'
import { deleteTransaction } from './routes/transaction/delete-transaction'
import { getProfile } from './routes/user/get-profile'
import { updateUser } from './routes/user/update-user'
import { deleteUser } from './routes/user/delete-user'
import { getExpenseTransactions } from './routes/analytics/get-expense-transactions'
import { getRevenueTransactions } from './routes/analytics/get-revenue-transactions'
import { getTotalBalance } from './routes/analytics/get-total-balance'
import { getDailyTransactionsInPeriod } from './routes/analytics/get-daily-transactions-in-period'

const app = fastify()

app.register(cors, { origin: true })
app.register(signUp)
app.register(signIn)
app.register(getProfile)
app.register(updateUser)
app.register(deleteUser)
app.register(getTransactions)
app.register(addTransaction)
app.register(updateTransaction)
app.register(deleteTransaction)
app.register(getExpenseTransactions)
app.register(getRevenueTransactions)
app.register(getTotalBalance)
app.register(getDailyTransactionsInPeriod)

app.listen({
  port: 3333
}).then(() => {
  console.log('HTTP server running on http://localhost:3333')
})