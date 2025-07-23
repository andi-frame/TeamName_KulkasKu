export interface Item {
  ID: string;
  CreatedAt: string;
  UpdatedAt: string;
  UserId: string;
  Name: string;
  Type: string;
  Amount: number;
  AmountType: string;
  Desc?: string | null;
  StartDate: string;
  ExpDate: string;
}
