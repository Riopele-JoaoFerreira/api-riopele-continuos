var cron = require('node-cron');
const utilities_opcua = require('../utilities/opcua')

exports.eventsSchedule = () => {
    cron.schedule('*/2 * * * *', () => {
      console.log(new Date().toLocaleString() + " - Exporting Events");
      utilities_opcua.exportEvents(() => {
        console.log(new Date().toLocaleString() + " - End Exporting Events");
      })
    });
    cron.schedule('*/5 * * * *', () => {
      console.log(new Date().toLocaleString() + " - Record Productions");
      utilities_opcua.recordProductions(()=> {
        console.log(new Date().toLocaleString() + " - End Record Productions");
      })
    });
    cron.schedule('1-59/2 * * * *', () => {
      console.log(new Date().toLocaleString() + " - Update Orders");
      utilities_opcua.updateOrders(()=> {
        console.log(new Date().toLocaleString() + " - End Update Orders");
      })
  });
}
