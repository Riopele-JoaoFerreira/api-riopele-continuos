var cron = require('node-cron');
const utilities_opcua = require('../utilities/opcua')

exports.eventsSchedule = () => {
    cron.schedule('*/140 * * * * *', () => {
      console.log("Exporting Events");
      utilities_opcua.exportEvents(()=> {})
    });
    cron.schedule('*/230 * * * * *', () => {
      console.log('Record Productions');
      utilities_opcua.recordProductions(()=> {})
    });
    cron.schedule('*/40 * * * * *', () => {
      console.log("Update Orders");
      utilities_opcua.updateOrders(()=> {})
  });
}
