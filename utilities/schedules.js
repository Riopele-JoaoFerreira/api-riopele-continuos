var cron = require('node-cron');
const utilities_opcua = require('../utilities/opcua')
let lock = false; 

exports.eventsSchedule = () => {
    cron.schedule('*/2 * * * *', () => {
      console.log('Exporting Events');
      if(!lock) {
        lock = true; 
        utilities_opcua.exportEvents((callback)=> {
          lock = false; 
        })
      } else {
        console.log('Locked');
      }
    });

    cron.schedule(' */5 * * * *', () => {
      console.log('Record Productions');
      if(!lock) {
        lock = true; 
        utilities_opcua.recordProductions((callback)=> {
          lock = false; 
        })
      } else {
        console.log('Locked');
      }
    });
    cron.schedule('*/40 * * * * *', () => {
      console.log('Update Running Orders');
      if(!lock) {
        lock = true; 
        utilities_opcua.updateOrders((callback)=> {
          lock = false; 
        })
      } else {
        console.log('Locked');
      }
  });

}
