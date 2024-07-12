import { db } from "../src/lib/db"

async function seed() {
  await db.team.create({
    data: {
      id: 'clyhw8cwq000011zhzqz45mv5',
      name: 'Equipe do Admin',
      members: {
        create: {
          id: 'clxz6ddl0000008jv3rt8ck4x',
          name: 'Admin Cash.io',
          email: 'admin@cash-io.com',
          password: '$2b$10$vc7oe1yobRWOv5G0uxs0TOQMjer7zoeXyal7pXl.VBN0Z.bfj0D1O',
          is_owner: true
        }
      }
    }
  })

  await db.transaction.create({
    data: {
      description: 'Assinatura Coursera',
      category: 'Investimentos',
      amount_in_cents: 3000,
      type: 'EXPENSE',
      created_by_id: 'clxz6ddl0000008jv3rt8ck4x',
      team_id: 'clyhw8cwq000011zhzqz45mv5'
    }
  })

  await db.transaction.create({
    data: {
      description: 'Freelancer',
      category: 'Serviços',
      amount_in_cents: 5000,
      type: 'REVENUE',
      created_by_id: 'clxz6ddl0000008jv3rt8ck4x',
      team_id: 'clyhw8cwq000011zhzqz45mv5'
    }
  })
}

seed().then(() => {
  console.log('Database seeded!')
  db.$disconnect()
})