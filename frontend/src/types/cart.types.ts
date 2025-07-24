export interface Cart {
  ID: string;
  CreatedAt: string;
  UpdatedAt: string;
  UserID: string;
  Name: string;
  Desc?: string | null;
}

export interface CartItem {
  ID: string;
  CreatedAt: string;
  UpdatedAt: string;
  CartID: string;
  Name: string;
  Type: string;
  Amount: number;
  AmountType: string;
  Desc?: string | null;
}
