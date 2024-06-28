import { db } from "../src/lib/db"

async function seed() {
  await db.user.create({
    data: {
      id: 'clxz6ddl0000008jv3rt8ck4x',
      name: 'Robert Johnson',
      email: 'robert@example.com',
      phone: '14991234567'
    }
  })

  await db.transaction.create({
    data: {
      description: 'Salário do mês',
      category: 'Trabalho',
      amount: 3000,
      type: 'REVENUE',
      createdById: 'clxz6ddl0000008jv3rt8ck4x'
    }
  })
}

seed().then(() => {
  console.log('Database seeded!')
  db.$disconnect()
})