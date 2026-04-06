export default interface AuthResponse {
  error?: string;
  success?: { token: string; secret: string };
}
