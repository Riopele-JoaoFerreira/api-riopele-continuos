var cron = require('node-cron');
const utilities_opcua = require('../utilities/opcua')
global.lock = false; 

exports.eventsSchedule = () => {
    cron.schedule('*/2 * * * *', () => {
      if(!global.lock) {
        console.log('Exporting Events');
        global.lock = true; 
        utilities_opcua.exportEvents((callback)=> {
          global.lock = false; 
          return callback(); 
        })
      } else {
        console.log('Locked');
      }
    });

    cron.schedule(' */5 * * * *', () => {
      if(!global.lock) {
        console.log('Record Productions');
        global.lock = true; 
        utilities_opcua.recordProductions((callback)=> {
          global.lock = false; 
          return callback(); 
        })
      } else {
        console.log('Locked');
      }
    });
    cron.schedule('*/40 * * * * *', () => {
      if(!global.lock) {
        console.log('Update Running Orders');
        global.lock = true; 
        utilities_opcua.updateOrders((callback)=> {
          global.lock = false; 
          return callback(); 
        })
      } else {
        console.log('Locked');
      }
  });

}
