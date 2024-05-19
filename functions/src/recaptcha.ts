import {onRequest} from 'firebase-functions/v2/https';
import axios from 'axios';
import * as cors from 'cors';
const corsHandler = cors({origin: true});
const USER_ERROR_CODES = ['missing-input-response', 'invalid-input-response'];
const SECRET_KEY = process.env.SECRET_KEY;

export const checkRecaptcha = onRequest((req, res) => {
  corsHandler(req, res, async () => {
    // 'http://localhost:8080'
    res.set('Access-Control-Allow-Origin', 'https://anthonybuzzelli.dev');
    res.setHeader('Content-Type', 'application/json');
    const token = req.body.token;
    // recommended from Claude const token = req.body.token
    console.log(token, 'what is here');
    try {
      const response = await axios.get(`https://recaptcha.google.com/recaptcha/api/siteverify?secret=${SECRET_KEY}&response=${token}`);

      const data = response.data;
      console.log('response data: ', data);
      if (data.success) {
        return res.status(200).send({score: data.score});
      }

      const errorCodes = data['error-codes'];
      if (errorCodes.length == 1 && USER_ERROR_CODES.includes(errorCodes[0])) {
        return res.status(400).send('Invalid Input');
      }
      return res.status(500).send('Internal Error');
    } catch (error) {
      console.log('error: ', error);
      return res.status(500).send('Internal Error');
    }
  });
});
