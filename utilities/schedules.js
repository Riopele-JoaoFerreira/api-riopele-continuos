var cron = require('node-cron');
const utilities_opcua = require('../utilities/opcua')
let lock = false; 

exports.eventsSchedule = () => {
    cron.schedule('*/2 * * * *', () => {
      if(!lock) {
        console.log('Exporting Events');
        lock = true; 
        utilities_opcua.exportEvents((callback)=> {
          lock = false; 
          return callback(); 
        })
      } else {
        console.log('Locked');
      }
    });

    cron.schedule(' */5 * * * *', () => {
      if(!lock) {
        console.log('Record Productions');
        lock = true; 
        utilities_opcua.recordProductions((callback)=> {
          lock = false; 
          return callback(); 
        })
      } else {
        console.log('Locked');
      }
    });
    cron.schedule('*/40 * * * * *', () => {
      if(!lock) {
        console.log('Update Running Orders');
        lock = true; 
        utilities_opcua.updateOrders((callback)=> {
          lock = false; 
          return callback(); 
        })
      } else {
        console.log('Locked');
      }
  });

}
