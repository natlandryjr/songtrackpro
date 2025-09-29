import { Router } from 'express'
import {
  connectSpotify,
  spotifyCallback,
  connectMeta,
  metaCallback,
  disconnectIntegration,
} from '../controllers/oauthController'
import { authMiddleware } from '../middleware/authMiddleware'

const router = Router()

// Spotify OAuth
router.get('/spotify/connect', authMiddleware, connectSpotify)
router.get('/spotify/callback', spotifyCallback)

// Meta OAuth
router.get('/meta/connect', authMiddleware, connectMeta)
router.get('/meta/callback', metaCallback)

// Disconnect
router.delete('/integrations/:provider', authMiddleware, disconnectIntegration)

export default router