import { Request, Response, NextFunction } from 'express'
import axios from 'axios'
import { AppError } from '../middleware/errorHandler'

// Spotify OAuth
export const connectSpotify = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI!

    const scopes = [
      'user-read-email',
      'user-read-private',
      'user-top-read',
      'user-library-read',
      'streaming',
      'user-read-recently-played',
    ].join(' ')

    const authUrl = `https://accounts.spotify.com/authorize?${new URLSearchParams({
      response_type: 'code',
      client_id: process.env.SPOTIFY_CLIENT_ID!,
      scope: scopes,
      redirect_uri: redirectUri,
      state: userId, // Pass userId as state for security
    })}`

    res.json({ authUrl })
  } catch (error) {
    next(error)
  }
}

export const spotifyCallback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, state, error } = req.query

    if (error) {
      throw new AppError(`Spotify authorization failed: ${error}`, 400)
    }

    if (!code || !state) {
      throw new AppError('Missing authorization code or state', 400)
    }

    const userId = state as string

    // Exchange code for access token
    const tokenResponse = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code as string,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
        client_id: process.env.SPOTIFY_CLIENT_ID!,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET!,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )

    const { access_token, refresh_token, expires_in, scope } = tokenResponse.data

    // Get user profile
    const profileResponse = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })

    const spotifyProfile = profileResponse.data

    // TODO: Save integration to database
    // await Integration.upsert({
    //   organizationId: user.organizationId,
    //   provider: 'spotify',
    //   accountId: spotifyProfile.id,
    //   accountName: spotifyProfile.display_name,
    //   accessToken: access_token,
    //   refreshToken: refresh_token,
    //   tokenExpiresAt: new Date(Date.now() + expires_in * 1000),
    //   scopes: scope.split(' '),
    //   status: 'connected',
    // })

    // Redirect back to frontend
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    res.redirect(`${frontendUrl}/integrations?spotify=success`)
  } catch (error) {
    next(error)
  }
}

// Meta OAuth
export const connectMeta = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId
    const redirectUri = process.env.META_REDIRECT_URI!

    const scopes = [
      'ads_management',
      'ads_read',
      'business_management',
      'read_insights',
    ].join(',')

    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?${new URLSearchParams({
      client_id: process.env.META_APP_ID!,
      redirect_uri: redirectUri,
      scope: scopes,
      state: userId,
      response_type: 'code',
    })}`

    res.json({ authUrl })
  } catch (error) {
    next(error)
  }
}

export const metaCallback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, state, error, error_description } = req.query

    if (error) {
      throw new AppError(`Meta authorization failed: ${error_description || error}`, 400)
    }

    if (!code || !state) {
      throw new AppError('Missing authorization code or state', 400)
    }

    const userId = state as string

    // Exchange code for access token
    const tokenResponse = await axios.get(
      `https://graph.facebook.com/v18.0/oauth/access_token?${new URLSearchParams({
        client_id: process.env.META_APP_ID!,
        client_secret: process.env.META_APP_SECRET!,
        redirect_uri: process.env.META_REDIRECT_URI!,
        code: code as string,
      })}`
    )

    const { access_token } = tokenResponse.data

    // Get long-lived token
    const longLivedTokenResponse = await axios.get(
      `https://graph.facebook.com/v18.0/oauth/access_token?${new URLSearchParams({
        grant_type: 'fb_exchange_token',
        client_id: process.env.META_APP_ID!,
        client_secret: process.env.META_APP_SECRET!,
        fb_exchange_token: access_token,
      })}`
    )

    const { access_token: longLivedToken, expires_in } = longLivedTokenResponse.data

    // Get user's ad accounts
    const adAccountsResponse = await axios.get(
      'https://graph.facebook.com/v18.0/me/adaccounts',
      {
        params: {
          access_token: longLivedToken,
          fields: 'id,name,account_status',
        },
      }
    )

    const adAccounts = adAccountsResponse.data.data

    if (!adAccounts || adAccounts.length === 0) {
      throw new AppError('No ad accounts found for this Meta account', 400)
    }

    // Use the first ad account
    const primaryAdAccount = adAccounts[0]

    // TODO: Save integration to database
    // await Integration.upsert({
    //   organizationId: user.organizationId,
    //   provider: 'meta',
    //   accountId: primaryAdAccount.id,
    //   accountName: primaryAdAccount.name,
    //   accessToken: longLivedToken,
    //   tokenExpiresAt: expires_in ? new Date(Date.now() + expires_in * 1000) : null,
    //   scopes: ['ads_management', 'ads_read', 'business_management', 'read_insights'],
    //   status: 'connected',
    //   metadata: { adAccounts },
    // })

    // Redirect back to frontend
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    res.redirect(`${frontendUrl}/integrations?meta=success`)
  } catch (error) {
    next(error)
  }
}

export const disconnectIntegration = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { provider } = req.params
    const userId = (req as any).user.userId

    if (!['spotify', 'meta'].includes(provider)) {
      throw new AppError('Invalid provider', 400)
    }

    // TODO: Disconnect integration in database
    // await Integration.update(
    //   { status: 'disconnected' },
    //   { where: { organizationId: user.organizationId, provider } }
    // )

    res.json({ message: `${provider} disconnected successfully` })
  } catch (error) {
    next(error)
  }
}