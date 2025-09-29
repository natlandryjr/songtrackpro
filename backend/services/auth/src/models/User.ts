import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/database'

export interface UserAttributes {
  id: string
  email: string
  name: string
  passwordHash: string
  createdAt?: Date
  updatedAt?: Date
}

class User extends Model<UserAttributes> implements UserAttributes {
  public id!: string
  public email!: string
  public name!: string
  public passwordHash!: string
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
  }
)

export default User