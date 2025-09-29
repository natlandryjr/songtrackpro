import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'
import { Subscription as SubType, SubscriptionTier, SubscriptionStatus } from '../types/database'

interface SubCreationAttributes extends Optional<SubType, 'id' | 'stripeSubscriptionId' | 'trialEndsAt' | 'createdAt' | 'updatedAt'> {}

class Subscription extends Model<SubType, SubCreationAttributes> implements SubType {
  public id!: string
  public organizationId!: string
  public stripeCustomerId!: string
  public stripeSubscriptionId?: string
  public tier!: SubscriptionTier
  public status!: SubscriptionStatus
  public currentPeriodStart!: Date
  public currentPeriodEnd!: Date
  public cancelAtPeriodEnd!: boolean
  public trialEndsAt?: Date
  public metadata!: Record<string, any>
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Subscription.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'organizations',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    stripeCustomerId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    stripeSubscriptionId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    tier: {
      type: DataTypes.ENUM(...Object.values(SubscriptionTier)),
      allowNull: false,
      defaultValue: SubscriptionTier.FREE,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(SubscriptionStatus)),
      allowNull: false,
      defaultValue: SubscriptionStatus.ACTIVE,
    },
    currentPeriodStart: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    currentPeriodEnd: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    cancelAtPeriodEnd: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    trialEndsAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    metadata: {
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
    tableName: 'subscriptions',
    timestamps: true,
    indexes: [
      { fields: ['organizationId'], unique: true },
      { fields: ['stripeCustomerId'], unique: true },
      { fields: ['tier'] },
      { fields: ['status'] },
    ],
  }
)

export default Subscription