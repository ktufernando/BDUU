'use strict';

module.exports = {
	db: 'mongodb://172.31.28.14/dbuu-dev',
    neo4j: {
        server: 'http://localhost:7474',
        endpoint: '/dbuu-local'
    },
	app: {
		title: 'BDUU - Local Environment'
	},
	facebook: {
		clientID: process.env.FACEBOOK_ID || '121701074674429',
		clientSecret: process.env.FACEBOOK_SECRET || 'c184c0bace2a2f1d407986d686febfd3',
		callbackURL: 'https://localhost:3000/auth/facebook/callback'
	},
	twitter: {
		clientID: process.env.TWITTER_KEY || '7ugLkupJtRju9xBFmjgZ8HSkd',
		clientSecret: process.env.TWITTER_SECRET || 'ZtRqgOghTN1bIjb3LebNYkoVwx2FmC0ruJD5zhls5tDyRQAZNY',
		callbackURL: 'http://localhost:3000/auth/twitter/callback'
	},
	google: {
		clientID: process.env.GOOGLE_ID || '326653484148-ll254brnqh1fjbhsjmvk2b6403o6nmmf.apps.googleusercontent.com',
		clientSecret: process.env.GOOGLE_SECRET || 'JL0bTAiDmdQGZXqhPE_W5aT6',
		callbackURL: 'http://localhost:3000/auth/google/callback'
	},
	linkedin: {
		clientID: process.env.LINKEDIN_ID || '75jvb78tyvakxf',
		clientSecret: process.env.LINKEDIN_SECRET || 'MxTN9k0xfFHbTouv',
		callbackURL: 'http://localhost:3000/auth/linkedin/callback'
	},
	github: {
		clientID: process.env.GITHUB_ID || 'APP_ID',
		clientSecret: process.env.GITHUB_SECRET || 'APP_SECRET',
		callbackURL: 'http://localhost:3000/auth/github/callback'
	},
	mailer: {
		from: process.env.MAILER_FROM || 'fervaldes11@gmail.com',
		options: {
			service: process.env.MAILER_SERVICE_PROVIDER || 'Gmail',
			auth: {
				user: process.env.MAILER_EMAIL_ID || 'fervaldes11@gmail.com',
				pass: process.env.MAILER_PASSWORD || 'Ktufernando01'
			}
		}
	}
};
