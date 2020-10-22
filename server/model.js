const sequelize = require('./tables').sequelize;
sequelize.sync();

const {
  Connection,
  Sequelize: { Op }
} = require('./tables');
sequelize.query('SET NAMES utf8;');


module.exports = {
    get : {
        db_data : callback => {
            Connection.findAll()
            .then( result => { callback(result) })
            .catch( err => { throw err })
        },
    }
}