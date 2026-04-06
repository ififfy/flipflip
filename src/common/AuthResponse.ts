export default interface AuthResponse {
  error?: { statusCode: number; data: string };
  success?: { token: string; secret: string };
}
