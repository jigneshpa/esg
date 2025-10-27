export interface Country {
  id: number;
  name: string;
}

export interface CountryApiResponse {
  code: number;
  data: Country[];
  message: string;
}
