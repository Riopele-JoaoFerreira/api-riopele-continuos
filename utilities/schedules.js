var cron = require('node-cron');
const utilities_opcua = require('../utilities/opcua')

exports.eventsSchedule = () => {
    cron.schedule('*/10 * * * * *', () => {
        utilities_opcua.exportEvents((callback)=> {
          console.log("done");
        })
    });
}