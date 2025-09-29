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
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    underscored: false,
    timestamps: true,
  },
})

export const initDatabase = async () => {
  try {
    await sequelize.authenticate()
    console.log('✓ PostgreSQL connection established successfully')

    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false })
      console.log('✓ Database models synchronized')
    }
  } catch (error) {
    console.error('✗ Unable to connect to PostgreSQL:', error)
    throw error
  }
}

export default sequelize