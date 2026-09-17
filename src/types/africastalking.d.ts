declare module 'africastalking' {
  interface SMS {
    send(options: { to: string[]; message: string; from?: string }): Promise<{statusCode: number; message: string[]}>;
  }
  interface AfricastalkingInstance {
    SMS: SMS;
  }
  function Africastalking(credentials: { apiKey: string; username: string }): AfricastalkingInstance;
  export default Africastalking;
}
