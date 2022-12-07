var cron = require('node-cron');
const utilities_opcua = require('../utilities/opcua')

exports.eventsSchedule = () => {
    cron.schedule('15 * * * * *', () => {
      console.log(new Date().toLocaleString() + " - Exporting Events");
      utilities_opcua.exportEvents(() => {})
    });
    cron.schedule('30 * * * * *', () => {
      console.log(new Date().toLocaleString() + " - Record Productions");
      utilities_opcua.recordProductions(()=> {})
    });
    cron.schedule('45 * * * * *', () => {
      console.log(new Date().toLocaleString() + " - Update Orders");
      utilities_opcua.updateOrders(()=> {})
  });
}
