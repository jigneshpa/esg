export interface ErrorData {
  message: string;
}
export interface ISelect {
  value: string | number;
  label: string;
}

export interface Company {
  id: number;
  userId: number;
  leiId: string;
  name: string;
  address: string;
  postalCode: string;
  countryId: number;
  industryId: number;
  createdAt: string;
  updatedAt: string;
  logoId: any;
  country: Country;
}

export interface Country {
  id: number;
  name: string;
}
