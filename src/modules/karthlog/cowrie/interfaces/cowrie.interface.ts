export interface ICowrie {
  id: string;
  amountPerCowrie: number;
  currency: string;
  isCreated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICowrieHistory {
  id: string;
  rate: number;
  emailOfSetter: string | null;
  createdAt: Date;
  updatedAt: Date;
}
