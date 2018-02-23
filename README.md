### CONFIGURATION

- Add your domain to verify and Update TXT, CNAME and MX record in DNS Zone Manager
- To receive emails in SES, you must verify domain and after that set up RULES
- Add your domain email address(whatever) and set trigger actions(for example: Lambda or S3)
- Basically you can only get email header information. To get email body, you have to save email to S3 bucket.
- Set up S3 bucket as trigger in SES. so you can save all emails that are received and get Email body.
- In lambda function, you can get email body like this

> const messageID = event.Records[0].ses.mail.messageId;
const s3 = new AWS.S3({
    apiVersion:'2006-03-01'
  });
  const params = {
    Bucket:'YOUR BUCKET',
    Key:messageID
  }
  s3.getObject(params, function(err, data) {
    if(err) {
      console.log(JSON.stringify(err))
    } else {
		...
	}
	
---
### - Using Mailparser
- After get mail body, you can parse that string using Mailparser so that can get specific values.
>
       const simpleParser = require('mailparser').simpleParser;
	   
       simpleParser(data.Body.toString(), (err, mail) => {
	   
        if(err) {
          console.log(JSON.stringify(err))
        } else {
          console.log(mail.text)
          const ses = new AWS.SES();
          const from = "test1@test.com";
          const to = ["test2@test.com"];
          const subject = mail.subject;
          var text = mail.text;
		
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
---
DONE
