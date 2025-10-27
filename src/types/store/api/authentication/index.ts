import { User } from '../../../user';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  data: {
    accessToken: string,
    refreshToken: string,
    user: User
  };
}

export interface SignUpRequest {
  confirmPassword: string;
  country_id: number;
  department: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  user_name: string;
}

export interface SignUpResponse {
  code: number;
  data: {
    user_id: number
  };
  message: string;
}

export interface VerifyCodeSignUpRequest {
  code: string;
  user_id: number;
}

export interface VerifyCodeSignUpResponse {
  code: number;
  message: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  code: number;
  data: {
    user_id: number
  };
  message: string;
}

export interface VerifyCodeForgotPasswordRequest {
  code: string;
  user_id: number;
}

export interface VerifyCodeForgotPasswordResponse {
  code: number;
  message: string;
}

export interface ResetPasswordRequest {
  confirmPassword: string;
  password: number;
}

export interface ResetPasswordResponse {
  code: number;
  message: string;
}
