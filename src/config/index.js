require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  dataFilePath: process.env.DATA_FILE_PATH || `${__dirname}/../../data/expenses.json`,
};
