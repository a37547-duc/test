const cron = require("node-cron");
const moment = require("moment");

const deleteMoment = (async) => {
  const tryDate = moment().subtract(4, "days").toDate();
  console.log(tryDate);
};

cron.schedule(" */50 * * * * *", () => {
  deleteMoment();
  console.log("running a task every two minutes");
});
