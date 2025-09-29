import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'
import { User as UserType, UserRole } from '../types/database'

interface UserCreationAttributes extends Optional<UserType, 'id' | 'organizationId' | 'avatar' | 'lastLoginAt' | 'createdAt' | 'updatedAt'> {}

class User extends Model<UserType, UserCreationAttributes> implements UserType {
  public id!: string
  public email!: string
  public name!: string
  public passwordHash!: string
  public role!: UserRole
  public organizationId?: string
  public avatar?: string
  public emailVerified!: boolean
  public onboardingCompleted!: boolean
  public lastLoginAt?: Date
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
    role: {
      type: DataTypes.ENUM(...Object.values(UserRole)),
      allowNull: false,
      defaultValue: UserRole.ARTIST,
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'organizations',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    onboardingCompleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    indexes: [
      { fields: ['email'], unique: true },
      { fields: ['organizationId'] },
      { fields: ['role'] },
      { fields: ['createdAt'] },
    ],
  }
)

export default User