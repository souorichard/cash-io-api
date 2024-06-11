import fastify from 'fastify'
import { signUp } from './routes/auth/sign-up'
import { signIn } from './routes/auth/sign-in'
import { getTransactions } from './routes/transaction/get-transactions'

const app = fastify()

app.register(signUp)
app.register(signIn)
app.register(getTransactions)

app.listen({
  port: 3333
}).then(() => {
  console.log('HTTP server running on http://localhost:3333')
})