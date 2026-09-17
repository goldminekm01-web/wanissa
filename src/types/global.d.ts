declare module 'africastalking' {
  export default function Africastalking(credentials: { apiKey: string; username: string }): { SMS: { send: (opts: { to: string[]; message: string; from?: string }) => Promise<{statusCode: number; message: string[]}> } };
}
