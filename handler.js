'use strict';
const AWS = require('aws-sdk')
const simpleParser = require('mailparser').simpleParser;

exports.handler = (event, context, callback) => {
  
  const messageID = event.Records[0].ses.mail.messageId;
  // read contents from s3
  AWS.config.update({
    accessKeyId:"AKIAXXXXXXXX",
    secretAccessKey:"XXXXXXXXXXXXXXXXXXXXXX",
    region:"eu-west-1"
  })
  const s3 = new AWS.S3({
    apiVersion:'2006-03-01'
  });
  const params = {
    Bucket:'ses-emails-dev',
    Key:messageID
  }
  s3.getObject(params, function(err, data) {
    if(err) {
      console.log(JSON.stringify(err))
    } else {
      simpleParser(data.Body.toString(), (err, mail) => {
        if(err) {
          console.log(JSON.stringify(err))
        } else {
          console.log(mail.text)


          const ses = new AWS.SES();
          const from = "test1@devserver.im";
          const to = ["alerts_inbound@grahamb.co.uk"];
          const subject = mail.subject;
          var text = mail.text;

          if(checkContents(text) || checkContents(subject)) {
            text += "[CHECKED. Alert word is included in this email.]";
          }
          ses.sendEmail({
            Source : from,
            Destination: {ToAddresses : to},
            Message: {
              Subject: {
                Data: subject
              },
              Body : {
                Text: {
                  Data: text
                }
              }
            }
          }, function(err, data) {
            if(err) {
              console.log('error occured:', JSON.stringify(err))
            } else {
              console.log("Email sent successfully.")
            }
          });
        }
      })
    }
  })

 //  callback(null, null);

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};

const checkContents = (data) => {

  const pattern = "alert";
  if(data.indexOf(pattern) !== -1) {
    return true;
  } else {
    return false;
  }
}

