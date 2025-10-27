import { ISelect } from '@/types/common';

export const answerTypes: ISelect[] = [
  { value: 'textBox', label: 'TextBox' },
  { value: 'checkbox', label: 'Checkbox' },
  //   { value: 'compare', label: 'Compare' },
  { value: 'dropDown', label: 'DropDown' },
  { value: 'radio', label: 'Radio Button' },
  { value: 'table', label: 'Table' }
];

export const comparisonOptions: ISelect[] = [
  { value: 'greater', label: 'Greater than' },
  { value: 'smaller', label: 'Smaller than' },
  { value: 'equal', label: 'Equal' }
];

export const rolesOptions: ISelect[] = [
  { value: 'Admin', label: 'Admin' },
  { value: 'Manager', label: 'Manager-L1' },
  { value: 'User', label: 'Employee' }
];
export const statusOptions: ISelect[] = [
  { value: 'Active', label: 'Active' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Inactive', label: 'Inactive' }
];
