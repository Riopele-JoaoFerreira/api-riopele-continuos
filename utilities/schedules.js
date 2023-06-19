var cron = require('node-cron');
const utilities_opcua = require('../utilities/opcua')
const utilities = require('../utilities/utilities');
const sap_webservice_request = require('../utilities/sap_webservice_request')

exports.eventsSchedule = () => {
  cron.schedule('10 * * * * *', () => {
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
  cron.schedule('40 * * * * *', () => {
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
  cron.schedule('*/4 * * * *', () => {
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
  cron.schedule('* * * * *', () => {
    console.log(new Date().toLocaleString() + " - Locked Check");
    utilities.check_locked_time()
  });
  cron.schedule('0 0 1 * *', () => {
    console.log(new Date().toLocaleString() + " - Enviar Lista Eventos Sap");
    sap_webservice_request.enviar_lista_eventos()
  });
}
