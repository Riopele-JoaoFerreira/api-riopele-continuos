var cron = require('node-cron');
const utilities_opcua = require('../utilities/opcua')
const utilities = require('../utilities/utilities');

exports.eventsSchedule = () => {
    cron.schedule('5 * * * * *', () => {
      utilities.isLocked((locked) => {
        if(!locked) {
          utilities.lock(); 
          console.log(new Date().toLocaleString() + " - Exporting Events");
          utilities_opcua.exportEvents(() => {
            utilities.unlock(); 
            console.log(new Date().toLocaleString() + " - End Exporting Events");
          })
        } else {
          console.log("Locked"); 
        }
      })
    });
    cron.schedule('10 */5 * * * *', () => {
      utilities.isLocked((locked) => {
        if(!locked) {
          utilities.lock(); 
          console.log(new Date().toLocaleString() + " - Record Productions");
          utilities_opcua.recordProductions(()=> {
            utilities.unlock(); 
            console.log(new Date().toLocaleString() + " - End Record Productions");
          })
        } else {
          console.log("Locked"); 
        }
      })
    });
    cron.schedule('15 /2* * * * *', () => {
      utilities.isLocked((locked) => {
        if(!locked) {
          utilities.lock(); 
          console.log(new Date().toLocaleString() + " - Update Orders");
          utilities_opcua.updateOrders(()=> {
            utilities.unlock(); 
            console.log(new Date().toLocaleString() + " - End Update Orders");
          })
        } else {
          console.log("Locked"); 
        }
      })
  });
}
