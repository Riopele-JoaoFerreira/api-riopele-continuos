var cron = require('node-cron');
const utilities_opcua = require('../utilities/opcua')

exports.eventsSchedule = () => {
    cron.schedule('*/2 * * * *', () => {
      console.log('Exporting Events');
      utilities_opcua.exportEvents((callback)=> {})
    });

    cron.schedule(' */5 * * * *', () => {
      console.log('Record Productions');
      utilities_opcua.recordProductions((callback)=> {})
    });
    cron.schedule(' * * * * *', () => {
      console.log('Update Running Orders');
      utilities_opcua.updateOrders((callback)=> {})
  });

}
