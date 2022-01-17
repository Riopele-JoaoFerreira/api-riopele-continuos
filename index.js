const express = require('express')
const config = require('./config/config').config
const connection = require('./utilities/connection').connection
const schedules = require('./utilities/schedules')
const middlewares = require('./utilities/middlewares')
const app = express();

app.use(express.json()); 

<<<<<<< HEAD
app.use(function(req, res, next) {
=======
/*app.use(function(req, res, next) {
>>>>>>> develop
    middlewares.verifyToken(req,res,next)
});

app.use(function(req, res, next) {
    middlewares.verifyIP(req,res,next)
<<<<<<< HEAD
});
=======
});*/
>>>>>>> develop

// ROUTES
const servidores_opcua = require('./routes/riopele40_servidores_opcua')
app.use('/servidores', servidores_opcua)
const maquinas = require('./routes/riopele40_maquinas')
app.use('/maquinas', maquinas)
const opcua = require('./routes/opcua')
app.use('/opcua', opcua)

app.listen(config.port, () => {
    console.log("API is running on " + config.port);
    schedules.schedule1(); 
    schedules.schedule2();
    connection.authenticate().then(function(errors) { 
        if (errors) {
            console.error('Unable to connect to the database:', errors);
        } else {
            console.log('Connected to SQL Server');
        }
    });
})