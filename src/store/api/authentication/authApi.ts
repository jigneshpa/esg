import {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  SignUpRequest,
  SignUpResponse,
  VerifyCodeForgotPasswordRequest,
  VerifyCodeForgotPasswordResponse,
  VerifyCodeSignUpRequest,
  VerifyCodeSignUpResponse
} from '@/types/store/api/authentication';

import { privateApiSlice } from '../api';

export const authApi = privateApiSlice.injectEndpoints({
  endpoints: build => ({
    login: build.mutation<LoginResponse, LoginRequest>({
      query: body => ({
        url: 'sign-in',
        method: 'POST',
        body
      })
    }),
    signUp: build.mutation<SignUpResponse, SignUpRequest>({
      query: body => ({
        url: 'sign-up',
        method: 'POST',
        body
      })
    }),
    verifyCodeSignUp: build.mutation<VerifyCodeSignUpResponse, VerifyCodeSignUpRequest>({
      query: body => ({
        url: 'verify-code-sign-up',
        method: 'POST',
        body
      })
    }),
    forgotPassword: build.mutation<ForgotPasswordResponse, ForgotPasswordRequest>({
      query: body => ({
        url: 'forgot-password',
        method: 'POST',
        body
      })
    }),
    verifyCodeForgotPassword: build.mutation<VerifyCodeForgotPasswordResponse, VerifyCodeForgotPasswordRequest>({
      query: body => ({
        url: 'verify-code-forgot-password',
        method: 'POST',
        body
      })
    }),
    resetPassword: build.mutation<ResetPasswordRequest, ResetPasswordResponse>({
      query: body => ({
        url: 'reset-password',
        method: 'POST',
        body
      })
    })
  })
});
