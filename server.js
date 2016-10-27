'use strict';

var cluster = require('cluster'),
    winston = require('winston'),
    init = require('./config/init')(),
    config = require('./config/config'),
    mongoose = require('mongoose'),
    https = require('https'),
    fs = require('fs');

winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
    colorize: true
});
winston.add(winston.transports.File, {
    filename: 'logs/output.log'
});

// Code to run if we're in the master process
if (cluster.isMaster) {

    // Count the machine's CPUs
    var cpuCount = require('os').cpus().length;

    // Create a worker for each CPU
    for (var i = 0; i < cpuCount; i += 1) {
        var worker = cluster.fork().process;
        winston.info('worker %s started.', worker.pid);
    }

    cluster.on('exit', function(worker) {
        winston.error('worker %s died. Restart...', worker.process.pid);
        cluster.fork();
    });

// Code to run if we're in a worker process
} else {

    /**
     * Main application entry file.
     * Please note that the order of loading is important.
     */

    // Log GNU copyright info along with server info
    winston.info('Starting BDUU - Base de Datos Unica de Usuario de Provincia Net');
    winston.info('Connecting to MongoDB...');

    // Bootstrap db connection
    var db = mongoose.connect(config.db, function (err) {
        if (err) {
            winston.log('error','Could not connect to MongoDB!');
            winston.log('error',err);
        }
    });

    // Init the express application
    var app = require('./config/express')(db);

    // Bootstrap passport config
    require('./config/passport')();

    var options = {
        key: fs.readFileSync('privatekey.pem'),
        cert: fs.readFileSync('certificate.pem')
    };

    var server = https.createServer(options, app);

    // Start the app by listening on <port>
    server.listen(config.port, function() {
        // Logging initialization
        winston.info('BDUU application started on port ' + config.port);
    });

    // Expose app
    var exports = module.exports = app;
}

process.on('uncaughtException', function (err) {
    winston.log('error',(new Date()).toUTCString() + ' uncaughtException:', err.message);
    winston.log('error',err.stack);
    process.exit(1);
});
