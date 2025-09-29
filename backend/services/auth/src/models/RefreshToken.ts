import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/database'
import User from './User'

export interface RefreshTokenAttributes {
  id: string
  userId: string
  token: string
  expiresAt: Date
  createdAt?: Date
}

class RefreshToken extends Model<RefreshTokenAttributes> implements RefreshTokenAttributes {
  public id!: string
  public userId!: string
  public token!: string
  public expiresAt!: Date
  public readonly createdAt!: Date
}

RefreshToken.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'refresh_tokens',
    timestamps: true,
    updatedAt: false,
  }
)

RefreshToken.belongsTo(User, { foreignKey: 'userId' })

export default RefreshToken