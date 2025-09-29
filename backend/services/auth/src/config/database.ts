import { Sequelize } from 'sequelize'

export const sequelize = new Sequelize({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'songtrackpro',
  username: process.env.POSTGRES_USER || 'songtrackpro',
  password: process.env.POSTGRES_PASSWORD || 'dev_password',
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
})

export const initDatabase = async () => {
  try {
    await sequelize.authenticate()
    console.log('Database connection established successfully')

    // Sync models in development
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true })
      console.log('Database models synchronized')
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error)
    throw error
  }
}