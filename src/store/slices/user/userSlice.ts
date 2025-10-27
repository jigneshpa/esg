import { User } from '@/types/user';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type UserState = Partial<User>;

const initialState: UserState = {
  id: undefined,
  userName: undefined,
  email: undefined,
  roleId: undefined,
  department: undefined,
  status: undefined,
  firstName: undefined,
  lastName: undefined,
  isVerified: undefined,
  createdAt: undefined,
  updatedAt: undefined,
  avatarId: undefined,
  addByAdmin: undefined,
  countryId: undefined,
  autoUnactive: undefined,
  avatar: undefined,
  role: undefined,
  country: undefined,
  fullName: undefined,
  companyId: undefined,
  toReporting: undefined,
  reportingManager: undefined
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState>) => {
      return action.payload;
    },
    clearUser: () => initialState
  }
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
