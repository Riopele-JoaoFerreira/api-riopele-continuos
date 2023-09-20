const express = require('express')
const config = require('./config/config').config
const connection = require('./utilities/connection').connection
const schedules = require('./utilities/schedules')
const orders = require('./routes/riopele40_ordens')
const status = require('./routes/status')
const utilities = require('./utilities/utilities')
const app = express();
app.use(express.json()); 
app.use('/orders', orders)
app.use('/status', status)
app.listen(config.port, () => {
    console.log("API is running on " + config.port);
    utilities.unlock(); 
    schedules.eventsSchedule(); 
    connection.authenticate().then(function(errors) { 
        if (errors) {
            console.error('Unable to connect to the database:', errors);
        } else {
            console.log('Connected to SQL Server');
        }
    });
    process.on("uncaughtException", function (err) {
        utilities.unlock(); 
        console.log("Caught exception: " + err);
    });
})

// export OPENSSL_CONF=/dev/null
// forever start -o out.log -e err.log index.js