import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'
import { Campaign as CampaignType, CampaignStatus } from '../types/database'

interface CampaignCreationAttributes extends Optional<CampaignType, 'id' | 'description' | 'trackId' | 'endDate' | 'metaAdAccountId' | 'metaCampaignId' | 'createdAt' | 'updatedAt'> {}

class Campaign extends Model<CampaignType, CampaignCreationAttributes> implements CampaignType {
  public id!: string
  public organizationId!: string
  public name!: string
  public description?: string
  public trackId?: string
  public status!: CampaignStatus
  public objective!: string
  public budget!: number
  public budgetSpent!: number
  public currency!: string
  public startDate!: Date
  public endDate?: Date
  public metaAdAccountId?: string
  public metaCampaignId?: string
  public targetAudience!: Record<string, any>
  public creativeAssets!: Record<string, any>
  public settings!: Record<string, any>
  public createdBy!: string
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Campaign.init(
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    trackId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tracks',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(CampaignStatus)),
      allowNull: false,
      defaultValue: CampaignStatus.DRAFT,
    },
    objective: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    budget: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    budgetSpent: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'USD',
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    metaAdAccountId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    metaCampaignId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    targetAudience: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    creativeAssets: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    settings: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
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
    tableName: 'campaigns',
    timestamps: true,
    indexes: [
      { fields: ['organizationId'] },
      { fields: ['trackId'] },
      { fields: ['status'] },
      { fields: ['startDate'] },
      { fields: ['createdBy'] },
      { fields: ['metaCampaignId'] },
    ],
  }
)

export default Campaign