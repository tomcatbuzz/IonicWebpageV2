// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
import {initializeApp} from 'firebase-admin/app';
initializeApp();

export {sendContactMessage} from './sendgrid';
export {checkRecaptcha} from './recaptcha';
