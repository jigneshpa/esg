export type User = {
  id: number,
  userName: string,
  email: string,
  roleId: number,
  department: string,
  status: string,
  firstName: string,
  lastName: string,
  isVerified: number,
  createdAt: string,
  updatedAt: string,
  avatarId: number | null,
  addByAdmin: number,
  countryId: number,
  autoUnactive: number,
  contactNumber: string,
  avatar: string | null,
  role: string,
  country: {
    id: number,
    namber: string
  },
  fullName: string,
  companyId: number,
  fullAccess?: boolean | null,
  toReporting?: number | null,
  reportingManager?: {
    id: number,
    firstName: string,
    lastName: string,
    email: string,
    role: string
  } | null
};
