import { db } from "../src/lib/db"

async function seed() {
  await db.user.create({
    data: {
      id: 'clxz6ddl0000008jv3rt8ck4x',
      name: 'Admin',
      email: 'admin@cash-io.com',
      password: '$2b$10$vc7oe1yobRWOv5G0uxs0TOQMjer7zoeXyal7pXl.VBN0Z.bfj0D1O',
      phone: '14991234567'
    }
  })

  await db.transaction.create({
    data: {
      description: 'Exemplo 1',
      category: 'Outras',
      amount: 3000,
      type: 'REVENUE',
      createdById: 'clxz6ddl0000008jv3rt8ck4x'
    }
  })

  await db.transaction.create({
    data: {
      description: 'Exemplo 2',
      category: 'Alimentação',
      amount: 1200,
      type: 'EXPENSE',
      createdById: 'clxz6ddl0000008jv3rt8ck4x'
    }
  })
}

seed().then(() => {
  console.log('Database seeded!')
  db.$disconnect()
})