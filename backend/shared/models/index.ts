import User from './User.model'
import Organization from './Organization.model'
import Subscription from './Subscription.model'
import Campaign from './Campaign.model'
import Track from './Track.model'
import Integration from './Integration.model'

// Define relationships
Organization.hasMany(User, { foreignKey: 'organizationId', as: 'members' })
User.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' })

Organization.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' })

Organization.hasOne(Subscription, { foreignKey: 'organizationId', as: 'subscription' })
Subscription.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' })

Organization.hasMany(Track, { foreignKey: 'organizationId', as: 'tracks' })
Track.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' })

Organization.hasMany(Campaign, { foreignKey: 'organizationId', as: 'campaigns' })
Campaign.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' })

Campaign.belongsTo(Track, { foreignKey: 'trackId', as: 'track' })
Track.hasMany(Campaign, { foreignKey: 'trackId', as: 'campaigns' })

Campaign.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' })

Organization.hasMany(Integration, { foreignKey: 'organizationId', as: 'integrations' })
Integration.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' })

export {
  User,
  Organization,
  Subscription,
  Campaign,
  Track,
  Integration,
}

export default {
  User,
  Organization,
  Subscription,
  Campaign,
  Track,
  Integration,
}