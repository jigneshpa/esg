import { User } from '../../../user';

export interface UserInfoResponse {
  code: number;
  data: User;
  message: string;
}
