'use strict';

module.exports = {
	db: 'mongodb://172.31.28.21/dbuu-test,//172.31.28.22/dbuu-test,//172.31.28.23/dbuu-test',
    neo4j: '',
	port: 3000,
	app: {
		title: 'BDUU - Test Environment'
	},
    facebook: {
        clientID: process.env.FACEBOOK_ID || '712209228860795',
        clientSecret: process.env.FACEBOOK_SECRET || '6c4628503d2e6361e684adf85828b483',
        callbackURL: 'https://bduu-test.provincianet.com.ar/auth/facebook/callback'
    },
    twitter: {
        clientID: process.env.TWITTER_KEY || 'pMc9oUNEviS300okwWWpg9STG',
        clientSecret: process.env.TWITTER_SECRET || 'I9TtyjoDwds4r1vwFLiLl3Pw0J5TVuNs2l9Y5UGBgBcB74NuhL',
        callbackURL: 'http://bduu-test.provincianet.com.ar/auth/twitter/callback'
    },
    google: {
        clientID: process.env.GOOGLE_ID || '63626230459-158vdv3ssgfvulcu2iua1d9a8pv2jsao.apps.googleusercontent.com',
        clientSecret: process.env.GOOGLE_SECRET || 'N-IQRCtSq-Xq0pCBv0yk0257',
        callbackURL: 'http://bduu-test.provincianet.com.ar/auth/google/callback'
    },
    linkedin: {
        clientID: process.env.LINKEDIN_ID || '75knpnkeo55px1',
        clientSecret: process.env.LINKEDIN_SECRET || 'x4edoqVz5Gb39PzI',
        callbackURL: 'http://bduu-test.provincianet.com.ar/auth/linkedin/callback'
    },
    mailer: {
        from: process.env.MAILER_FROM || 'no-reply@provincianet.com.ar',
        options: {
            host: '172.31.28.17',
            port: 25
        }
    }
};
