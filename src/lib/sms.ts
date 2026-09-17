import Africastalking from 'africastalking';

const credentials = {
  apiKey: process.env.AT_API_KEY || '',
  username: process.env.AT_USERNAME || 'sandbox'
};

const africastalking = Africastalking(credentials);

export const sendSMS = async (to: string, message: string) => {
  try {
    const sms = africastalking.SMS;
    const options = {
      to: [to],
      message,
      from: process.env.AT_SENDER_ID || undefined
    };
    const response = await sms.send(options);
    return response;
  } catch (error) {
    console.error('Error sending SMS via Africastalking:', error);
    throw error;
  }
};
