var cron = require('node-cron');
const utilities_opcua = require('../utilities/opcua')

exports.eventsSchedule = () => {
    cron.schedule('*/140 * * * * *', () => {
      utilities_opcua.exportEvents(()=> {
        console.log("Exporting Events");
      })
    });
    cron.schedule('*/230 * * * * *', () => {
      utilities_opcua.recordProductions(()=> {
        console.log('Record Productions');
      })
    });
    cron.schedule('*/40 * * * * *', () => {
      utilities_opcua.updateOrders(()=> {
        console.log("Update Orders");
      })
  });
}
