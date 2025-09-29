export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'SongTrackPro API',
    version: '1.0.0',
    description: 'RESTful API for connecting Meta Ads campaigns with Spotify streaming analytics',
    contact: {
      name: 'API Support',
      email: 'support@songtrackpro.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
    {
      url: 'https://api.songtrackpro.com/v1',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
              details: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    field: { type: 'string' },
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          role: { type: 'string', enum: ['artist', 'label', 'agency', 'admin'] },
          emailVerified: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Campaign: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          description: { type: 'string' },
          status: { type: 'string', enum: ['draft', 'active', 'paused', 'completed', 'archived'] },
          budget: { type: 'number' },
          budgetSpent: { type: 'number' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          trackId: { type: 'string', format: 'uuid' },
          targetAudience: { type: 'object' },
          creativeAssets: { type: 'object' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Track: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          artist: { type: 'string' },
          album: { type: 'string' },
          releaseDate: { type: 'string', format: 'date' },
          duration: { type: 'number' },
          spotifyId: { type: 'string' },
          coverArtUrl: { type: 'string' },
          genres: { type: 'array', items: { type: 'string' } },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          total: { type: 'number' },
          limit: { type: 'number' },
          offset: { type: 'number' },
          hasNext: { type: 'boolean' },
        },
      },
    },
    responses: {
      UnauthorizedError: {
        description: 'Authentication token is missing or invalid',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      ForbiddenError: {
        description: 'Insufficient permissions',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      NotFoundError: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      ValidationError: {
        description: 'Validation failed',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      RateLimitError: {
        description: 'Rate limit exceeded',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'name'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  name: { type: 'string' },
                  organizationName: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/User' },
                    tokens: {
                      type: 'object',
                      properties: {
                        accessToken: { type: 'string' },
                        refreshToken: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Login successful' },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
        },
      },
    },
    '/campaigns': {
      get: {
        tags: ['Campaigns'],
        summary: 'List campaigns',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: ['draft', 'active', 'paused', 'completed', 'archived'] },
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'number', default: 20, maximum: 100 },
          },
          {
            name: 'offset',
            in: 'query',
            schema: { type: 'number', default: 0 },
          },
        ],
        responses: {
          '200': {
            description: 'List of campaigns',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    campaigns: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Campaign' },
                    },
                    pagination: { $ref: '#/components/schemas/Pagination' },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
        },
      },
      post: {
        tags: ['Campaigns'],
        summary: 'Create campaign',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'objective', 'budget', 'startDate'],
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  trackId: { type: 'string', format: 'uuid' },
                  objective: { type: 'string' },
                  budget: { type: 'number' },
                  startDate: { type: 'string', format: 'date-time' },
                  endDate: { type: 'string', format: 'date-time' },
                  targetAudience: { type: 'object' },
                  creativeAssets: { type: 'object' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Campaign created' },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
        },
      },
    },
    '/campaigns/{id}': {
      get: {
        tags: ['Campaigns'],
        summary: 'Get campaign',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          '200': { description: 'Campaign details' },
          '404': { $ref: '#/components/responses/NotFoundError' },
        },
      },
      patch: {
        tags: ['Campaigns'],
        summary: 'Update campaign',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Campaign' },
            },
          },
        },
        responses: {
          '200': { description: 'Campaign updated' },
          '404': { $ref: '#/components/responses/NotFoundError' },
        },
      },
      delete: {
        tags: ['Campaigns'],
        summary: 'Delete campaign',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          '204': { description: 'Campaign deleted' },
          '404': { $ref: '#/components/responses/NotFoundError' },
        },
      },
    },
    '/analytics/campaigns/{id}': {
      get: {
        tags: ['Analytics'],
        summary: 'Get campaign analytics',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
          {
            name: 'startDate',
            in: 'query',
            required: true,
            schema: { type: 'string', format: 'date-time' },
          },
          {
            name: 'endDate',
            in: 'query',
            required: true,
            schema: { type: 'string', format: 'date-time' },
          },
        ],
        responses: {
          '200': { description: 'Analytics data' },
          '404': { $ref: '#/components/responses/NotFoundError' },
        },
      },
    },
  },
  tags: [
    { name: 'Authentication', description: 'User authentication and OAuth' },
    { name: 'Campaigns', description: 'Campaign management' },
    { name: 'Tracks', description: 'Music track management' },
    { name: 'Audiences', description: 'Audience targeting' },
    { name: 'Analytics', description: 'Analytics and reporting' },
    { name: 'Integrations', description: 'Meta and Spotify integrations' },
    { name: 'Webhooks', description: 'Webhook management' },
  ],
}