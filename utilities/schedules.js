var cron = require('node-cron');
const utilities_opcua = require('../utilities/opcua')

exports.eventsSchedule = () => {
    cron.schedule('*/30 * * * * *', () => {
      console.log('Exporting Events');
      utilities_opcua.exportEvents((callback)=> {})
    });

   
    cron.schedule('*/10 * * * * *', () => {
      console.log('Update Running Orders');
      utilities_opcua.updateOrders((callback)=> {})
  });

  cron.schedule('*/10 * * * * *', () => {
    //console.log('Wake Session');
    //utilities_opcua.connect()
});
}