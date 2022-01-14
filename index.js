const express = require('express')
const config = require('./config/config').config
const connection = require('./utilities/connection').connection
const imports = require('./utilities/imports')
const app = express();

app.use(express.json()); 

// ROUTES
const servidores_opcua = require('./routes/riopele40_servidores_opcua')
app.use('/servidores', servidores_opcua)
const maquinas = require('./routes/riopele40_maquinas')
app.use('/maquinas', maquinas)

app.listen(config.port, () => {
    console.log("API is running on " + config.port);
    connection.authenticate().then(function(errors) { 
        if (errors) {
            console.error('Unable to connect to the database:', errors);
        } else {
            // Sync Database Tables
            imports.importModels(() => {}); 
            console.log('Connected to SQL Server');
        }
    });
})