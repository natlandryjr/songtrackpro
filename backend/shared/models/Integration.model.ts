import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'
import { Integration as IntegrationType, IntegrationProvider, IntegrationStatus } from '../types/database'

interface IntegrationCreationAttributes extends Optional<IntegrationType, 'id' | 'refreshToken' | 'tokenExpiresAt' | 'lastSyncAt' | 'lastErrorAt' | 'lastError' | 'createdAt' | 'updatedAt'> {}

class Integration extends Model<IntegrationType, IntegrationCreationAttributes> implements IntegrationType {
  public id!: string
  public organizationId!: string
  public provider!: IntegrationProvider
  public status!: IntegrationStatus
  public accountId!: string
  public accountName!: string
  public accessToken!: string
  public refreshToken?: string
  public tokenExpiresAt?: Date
  public scopes!: string[]
  public metadata!: Record<string, any>
  public lastSyncAt?: Date
  public lastErrorAt?: Date
  public lastError?: string
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Integration.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'organizations',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    provider: {
      type: DataTypes.ENUM(...Object.values(IntegrationProvider)),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(IntegrationStatus)),
      allowNull: false,
      defaultValue: IntegrationStatus.CONNECTED,
    },
    accountId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    accountName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    accessToken: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tokenExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    scopes: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    lastSyncAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastErrorAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastError: {
      type: DataTypes.TEXT,
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
    tableName: 'integrations',
    timestamps: true,
    indexes: [
      { fields: ['organizationId', 'provider'], unique: true },
      { fields: ['accountId'] },
      { fields: ['status'] },
      { fields: ['lastSyncAt'] },
    ],
  }
)

export default Integration