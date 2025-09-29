import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'
import { Organization as OrgType, UserRole } from '../types/database'

interface OrgCreationAttributes extends Optional<OrgType, 'id' | 'website' | 'logo' | 'subscriptionId' | 'createdAt' | 'updatedAt'> {}

class Organization extends Model<OrgType, OrgCreationAttributes> implements OrgType {
  public id!: string
  public name!: string
  public slug!: string
  public type!: UserRole
  public website?: string
  public logo?: string
  public ownerId!: string
  public subscriptionId?: string
  public settings!: Record<string, any>
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Organization.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isLowercase: true,
        is: /^[a-z0-9-]+$/,
      },
    },
    type: {
      type: DataTypes.ENUM(...Object.values(UserRole).filter(r => r !== UserRole.ADMIN)),
      allowNull: false,
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    subscriptionId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'subscriptions',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    settings: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
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
    tableName: 'organizations',
    timestamps: true,
    indexes: [
      { fields: ['slug'], unique: true },
      { fields: ['ownerId'] },
      { fields: ['type'] },
    ],
  }
)

export default Organization