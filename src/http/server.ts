import fastify from 'fastify'
import { signUp } from './routes/auth/sign-up'
import { signIn } from './routes/auth/sign-in'
import { getTransactions } from './routes/transaction/get-transactions'
import { addTransaction } from './routes/transaction/add-transaction'
import { updateTransaction } from './routes/transaction/update-transaction'
import { deleteTransaction } from './routes/transaction/delete-transaction'
import { updateUser } from './routes/user/update-user'
import { deleteUser } from './routes/user/delete-user'

const app = fastify()

app.register(signUp)
app.register(signIn)
app.register(getTransactions)
app.register(addTransaction)
app.register(updateTransaction)
app.register(deleteTransaction)
app.register(updateUser)
app.register(deleteUser)

app.listen({
  port: 3333
}).then(() => {
  console.log('HTTP server running on http://localhost:3333')
})