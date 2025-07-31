export class LoginPhoneRequest {
  phoneNumber: string;
}

export class LoginRequestUsingPhonePayload {
  phoneNumber: string;
  otpCode: string;
}
