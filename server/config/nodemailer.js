
module.exports = {
    mailer_poster : () => {
    const nodeMailer = require('nodemailer');

    const mailPoster = nodeMailer.createTransport({
        service: 'Naver',
        host: 'smtp.naver.com',
        port: 587,
        auth: {
            user: 'sejun3278@naver.com',
            pass: 'q1w2e3r4t5@1'
        }
    });

    return mailPoster;

    },
    
    mailOpt : (email, title, contents) => {
        const mailOptions = {
          from: 'sejun3278@naver.com',
          to: email ,
          subject: title,
          text: contents
        };
      
        return mailOptions;
    },

    sendMail : function (mailPoster, mailOption) {
        mailPoster.sendMail(mailOption, function(error, info){
          if (error) {
            console.log('에러 ' + error);
          }
          else {
            console.log('전송 완료 ' + info.response);
          }
        });
      }
}