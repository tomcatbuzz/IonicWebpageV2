import {onValueWritten} from 'firebase-functions/v2/database';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const sgMail = require('@sendgrid/mail');
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
sgMail.setApiKey(SENDGRID_API_KEY);

export const sendContactMessage = onValueWritten(
  'messages/{pushkey}', async (change) => {
    const dataAfterChange = change.data.after.val();
    if (change.data.before.val() || !dataAfterChange.subject) {
      return;
    }

    const val = dataAfterChange;

    const msg = {
      to: 'tomcatbuzz@yahoo.com',
      from: 'firebase@anthonybuzzelli.dev',
      subject: 'You have a new contact request',
      text: `Your message content. \n
      Sender's Name: ${val.name} \n
      Sender's Email: ${val.email} \n
      Subject: ${val.subject} \n
      Content: ${val.message}`,
    };
    await sgMail.send(msg)
      .then(() => {
        console.log('Email sent');
      })
      .catch((error: Error) => {
        console.error('Error Sending email', error);
      });
  });
