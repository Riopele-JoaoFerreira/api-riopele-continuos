const connection = require('../utilities/connection').connection
const moment = require('moment')

exports.verifyIP = (req, res, next) => {
    next(); 
}

exports.verifyToken = (req, res, next) => {
    let token = req.headers.token 
    let agora = moment().format('YYYY-MM-DD HH:mm:ss'); 

    if(!token || token == '') {
        res.status(401).send('Not Authorized'); 
    } else {
        connection.query("SELECT user_id FROM utilizadores_sessions WHERE token = '"+ token +"' AND canal = 'W' and data_expira >= '"+ agora +"'").then((user) => {
            if(user[1] == 0) {
                res.status(401).send('Not Authorized'); 
            } else {
                next();
            }
        }).catch((error) => {
            res.status(400).send('Error!')
        })
    }

    
}