var cron = require('node-cron');
const utilities_opcua = require('../utilities/opcua')

exports.schedule1 = () => {
    cron.schedule('*/2 * * * * *', () => {
      utilities_opcua.Cycle_eventos((callback)=> {
        console.log("done")
      })
    });
}

exports.schedule2 = () => {
    cron.schedule('* * * * *', () => {
        console.log('running a task every minute');
      });
}