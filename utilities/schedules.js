var cron = require('node-cron');
const utilities_opcua = require('../utilities/opcua')

exports.eventsSchedule = () => {
    cron.schedule('*/2 * * * *', () => {
      if(!global.lock) {
        global.lock = true; 
        console.log('Exporting Events');
        utilities_opcua.exportEvents(()=> {})
      } else {
        console.log('Locked');
      }
    });

    cron.schedule(' */5 * * * *', () => {
      if(!global.lock) {
        global.lock = true; 
        console.log('Record Productions');
        utilities_opcua.recordProductions(()=> {})
      } else {
        console.log('Locked');
      }
    });
    cron.schedule('*/40 * * * * *', () => {
      if(!global.lock) {
        global.lock = true; 
        console.log('Update Running Orders');
        utilities_opcua.updateOrders(()=> {})
      } else {
        console.log('Locked');
      }
  });

}
