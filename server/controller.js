const path = require('path');
const AWS = require('aws-sdk');
const model = require('./model');

AWS.config.loadFromPath(
    path.join(__dirname, 'config', 'awsConfig.json')
);

module.exports = {
    needs: () => upload,
    api : {
        test : (req, res) => {
            console.log('컨트롤러 연결 성공!')
            return res.send('컨트롤러 연결 성공!')
        },
    },

    get : {
        allState : (req, res) => {
            let result = {}
            result.server_state = true;
            result.db_state = false;

            model.get.db_data( data => {
                if(data[0].string !== false) {
                    result.db_state = true;
                }
                return res.send( result )
            })
        }
    }
}