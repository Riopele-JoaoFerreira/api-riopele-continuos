var cron = require('node-cron');
const utilities_opcua = require('../utilities/opcua')

exports.eventsSchedule = () => {
    cron.schedule('*/140 * * * * *', () => {
      utilities_opcua.exportEvents(()=> {})
    });
    cron.schedule('*/330 * * * * *', () => {
      utilities_opcua.recordProductions(()=> {})
    });
    cron.schedule('*/40 * * * * *', () => {
      utilities_opcua.updateOrders(()=> {})
  });
}
