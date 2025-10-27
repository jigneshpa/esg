export interface ISelect {
  value: string;
  label: string;
}

export const rolesOptions: ISelect[] = [
  { value: 'Admin', label: 'Admin' },
  { value: 'Manager', label: 'Manager-L1' },
  { value: 'User', label: 'Employee' },
  { value:'User-admin',label:'Client Admin'}
];
