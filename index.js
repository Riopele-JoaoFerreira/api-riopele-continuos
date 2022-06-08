const express = require('express')
const config = require('./config/config').config
const connection = require('./utilities/connection').connection
const schedules = require('./utilities/schedules')
const orders = require('./routes/riopele40_ordens')
const app = express();
app.use(express.json()); 
app.use('/orders', orders)
app.listen(config.port, () => {
    console.log("API is running on " + config.port);
    schedules.eventsSchedule(); 
    connection.authenticate().then(function(errors) { 
        if (errors) {
            console.error('Unable to connect to the database:', errors);
        } else {
            console.log('Connected to SQL Server');
        }
    });
})