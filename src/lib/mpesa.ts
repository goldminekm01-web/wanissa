export const getMpesaToken = async (): Promise<string | null> => {
  const consumerKey = process.env.MPESA_CONSUMER_KEY || '';
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET || '';

  if (!consumerKey || !consumerSecret) {
    console.error('M-Pesa credentials are missing from environment variables');
    return null;
  }

  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  const endpoint = process.env.MPESA_ENVIRONMENT === 'production'
    ? 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
    : 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${credentials}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('M-Pesa token error:', response.status, errText);
      return null;
    }

    const data = await response.json();
    return data.access_token as string;
  } catch (error) {
    console.error('Error fetching M-Pesa token:', error);
    return null;
  }
};

export const initiateStkPush = async (
  phone: string,
  amount: number,
  reference: string,
  description: string
) => {
  const token = await getMpesaToken();
  if (!token) throw new Error('Failed to get M-Pesa token. Check your Consumer Key/Secret in .env');

  const endpoint = process.env.MPESA_ENVIRONMENT === 'production'
    ? 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
    : 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

  const shortCode = process.env.MPESA_SHORTCODE || '174379';
  const passkey   = process.env.MPESA_PASSKEY   || '';
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
  const password  = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');

  // Format phone: accept 07XXXXXXXX, 2547XXXXXXXX, +2547XXXXXXXX
  let formattedPhone = phone.replace(/\s+/g, '').replace(/[^0-9+]/g, '');
  if (formattedPhone.startsWith('+')) formattedPhone = formattedPhone.slice(1);
  if (formattedPhone.startsWith('0'))  formattedPhone = '254' + formattedPhone.slice(1);
  if (!formattedPhone.startsWith('254')) formattedPhone = '254' + formattedPhone;

  const callbackUrl = process.env.MPESA_CALLBACK_URL;
  if (!callbackUrl) throw new Error('MPESA_CALLBACK_URL is not set in .env');

  const payload = {
    BusinessShortCode: shortCode,
    Password: password,
    Timestamp: timestamp,
    // CustomerBuyGoodsOnline = Till (Buy Goods), CustomerPayBillOnline = Paybill
    TransactionType: 'CustomerPayBillOnline',
    Amount: amount,
    PartyA: formattedPhone,
    PartyB: shortCode,
    PhoneNumber: formattedPhone,
    CallBackURL: callbackUrl,
    AccountReference: reference.slice(0, 12), // max 12 chars
    TransactionDesc: description.slice(0, 13), // max 13 chars
  };

  console.log('STK Push payload:', JSON.stringify(payload, null, 2));

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const responseData = await response.json();
  console.log('STK Push response:', JSON.stringify(responseData, null, 2));

  if (!response.ok || responseData.errorCode) {
    throw new Error(
      responseData.errorMessage || responseData.ResultDesc || 'STK Push request failed'
    );
  }

  return responseData;
};
