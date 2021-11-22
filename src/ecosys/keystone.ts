import { config } from '@keystone-next/keystone';
import { statelessSessions } from '@keystone-next/keystone/session';
import { createAuth } from '@keystone-next/auth';
import path from 'path';
import { lists } from './schema';
import { insertSeedData } from './seed-data';
require('dotenv').config();
const { DATABASE_URL } = process.env;

// createAuth configures signin functionality based on the config below. Note this only implements
// authentication, i.e signing in as an item using identity and secret fields in a list. Session
// management and access control are controlled independently in the main keystone config.
const { withAuth } = createAuth({
  // This is the list that contains items people can sign in as
  listKey: 'User',
  // The identity field is typically a username or email address
  identityField: 'email',
  // The secret field must be a password type field
  secretField: 'password',
  // initFirstItem turns on the "First User" experience, which prompts you to create a new user
  // when there are no items in the list yet
  initFirstItem: {
    // These fields are collected in the "Create First User" form
    fields: ['name', 'email', 'password'],
  },
});

// Stateless sessions will store the listKey and itemId of the signed-in user in a cookie.
// This session object will be made available on the context object used in hooks, access-control,
// resolvers, etc.
const session = statelessSessions({
  // The session secret is used to encrypt cookie data (should be an environment variable)
  secret: '-- EXAMPLE COOKIE SECRET; CHANGE ME --',
});
/* public paths in lower case*/
const publicPaths = [
  '/favicon.ico',
  '/locales/vi-vn/translation.json',
  '/locales/vi/translation.json',
  '/locales/en-us/translation.json',
  '/locales/en/translation.json'
];
export default withAuth(
  config({
    server: {
      port: 7997,
      maxFileSize: 200 * 1024 * 1024,
      healthCheck: true,
      extendExpressApp: (app, createContext) => { /* ... */ },
    },
    db: {
      provider: 'postgresql',
      url: DATABASE_URL || 'postgres://dbuser:dbpass@localhost:5432/stone',
      async onConnect(context) {
        console.log('Connected to db');
        if (process.argv.includes('--seed-data')) {
          await insertSeedData(context);
        }
      },
    },
    lists,
    session,
    ui: {
      publicPages: publicPaths,
      isAccessAllowed: async (context) => {
        const headers = context.req?.headers;
        const host = headers ? headers['x-forwarded-host'] || headers['host'] : null;
        const url = headers?.referer ? new URL(headers.referer) : undefined;
        const accessingPublicPath = url?.host === host && publicPaths.includes(context.req?.url?.toLowerCase() || '');
        return accessingPublicPath || context.session !== undefined;
      },
      getAdditionalFiles: [
        async (config) => [{
          mode: 'copy',
          inputPath: path.resolve(path.join('public', 'favicon.ico')),
          outputPath: 'public/favicon.ico',
        },
        {
          mode: 'copy',
          inputPath: path.resolve(path.join('locales', 'vi-VN', 'translation.json')),
          outputPath: 'public/locales/vi-VN/translation.json',
        },
        {
          mode: 'copy',
          inputPath: path.resolve(path.join('locales', 'vi-VN', 'translation.json')),
          outputPath: 'public/locales/vi/translation.json',
        },
        {
          mode: 'copy',
          inputPath: path.resolve(path.join('locales', 'en-US', 'translation.json')),
          outputPath: 'public/locales/en-US/translation.json',
        }, {
          mode: 'copy',
          inputPath: path.resolve(path.join('locales', 'en-US', 'translation.json')),
          outputPath: 'public/locales/en/translation.json',
        }
        ],
      ],
    },
  })
);
