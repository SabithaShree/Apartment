const schedule = require('node-schedule');

var rule = new schedule.RecurrenceRule();
rule.date = 1; // 1-31
rule.hour = 8; // 0-24
rule.minute = 0; // 0 - 59

var job = schedule.scheduleJob(rule, function(){
    console.log('Send mail');
});