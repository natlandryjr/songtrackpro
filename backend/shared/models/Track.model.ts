import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'
import { Track as TrackType } from '../types/database'

interface TrackCreationAttributes extends Optional<TrackType, 'id' | 'album' | 'releaseDate' | 'duration' | 'isrc' | 'spotifyId' | 'spotifyUri' | 'appleId' | 'coverArtUrl' | 'createdAt' | 'updatedAt'> {}

class Track extends Model<TrackType, TrackCreationAttributes> implements TrackType {
  public id!: string
  public organizationId!: string
  public title!: string
  public artist!: string
  public album?: string
  public releaseDate?: Date
  public duration?: number
  public isrc?: string
  public spotifyId?: string
  public spotifyUri?: string
  public appleId?: string
  public coverArtUrl?: string
  public genres!: string[]
  public metadata!: Record<string, any>
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Track.init(
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
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    artist: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    album: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    releaseDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    isrc: {
      type: DataTypes.STRING(12),
      allowNull: true,
      unique: true,
    },
    spotifyId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    spotifyUri: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    appleId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    coverArtUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    genres: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
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
    tableName: 'tracks',
    timestamps: true,
    indexes: [
      { fields: ['organizationId'] },
      { fields: ['spotifyId'], unique: true },
      { fields: ['isrc'], unique: true },
      { fields: ['artist'] },
      { fields: ['title'] },
    ],
  }
)

export default Track