var cron = require('node-cron');
const utilities_opcua = require('../utilities/opcua')

exports.eventsSchedule = () => {
    cron.schedule(' * * * * *', () => {
      console.log('Exporting Events');
      utilities_opcua.exportEvents((callback)=> {})
    });

    cron.schedule(' */2 * * * *', () => {
      console.log('Record Productions');
      utilities_opcua.recordProductions((callback)=> {})
    });
   
    cron.schedule('*/30 * * * * *', () => {
      console.log('Update Running Orders');
      utilities_opcua.updateOrders((callback)=> {})
  });

}
