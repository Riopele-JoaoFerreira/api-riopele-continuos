var cron = require('node-cron');

exports.schedule1 = () => {
    cron.schedule('0,10,20,30,40,50 * * * * *', () => {
        console.log('running a task every 10 secondes');
      });
}

exports.schedule2 = () => {
    cron.schedule('* * * * *', () => {
        console.log('running a task every minute');
      });
}