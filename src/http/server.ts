import fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import cors from '@fastify/cors'
import { signUp } from './routes/auth/sign-up'
import { signIn } from './routes/auth/sign-in'
import { getMember } from './routes/member/get-member'
import { getMembers } from './routes/member/get-members'
import { updateMember } from './routes/member/update-member'
import { deleteMember } from './routes/member/delete-member'
import { createTransaction } from './routes/transaction/create-transaction'
import { getTransactions } from './routes/transaction/get-transactions'
import { deleteTransaction } from './routes/transaction/delete-transaction'
import { getExpenseTransactions } from './routes/analytics/get-expense-transactions'
import { getRevenueTransactions } from './routes/analytics/get-revenue-transactions'
import { getTotalBalance } from './routes/analytics/get-total-balance'
import { getDailyTransactionsInPeriod } from './routes/analytics/get-daily-transactions-in-period'
import { getRecentTransactionOwners } from './routes/analytics/get-recent-transaction-owners'
import { getTeam } from './routes/team/get-team'
import { updateTeam } from './routes/team/update-team'
import { deleteTeam } from './routes/team/delete-team'
import { inviteTeam } from './routes/team/invite-team'
import { confirmMember } from './routes/member/confirm-member'

const app = fastify()

app.register(cors, {
  origin: process.env.WEB_BASE_URL,
  methods: 'GET, POST, PUT, DELETE, OPTIONS'
})
app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(signUp)
app.register(signIn)
app.register(getMember)
app.register(getMembers)
app.register(updateMember)
app.register(deleteMember)
app.register(createTransaction)
app.register(getTransactions)
app.register(deleteTransaction)
app.register(getExpenseTransactions)
app.register(getRevenueTransactions)
app.register(getTotalBalance)
app.register(getDailyTransactionsInPeriod)
app.register(getRecentTransactionOwners)
app.register(getTeam)
app.register(updateTeam)
app.register(deleteTeam)
app.register(inviteTeam)
app.register(confirmMember)

app.listen({
  port: 3333
}).then(() => {
  console.log('HTTP server running on http://localhost:3333')
})