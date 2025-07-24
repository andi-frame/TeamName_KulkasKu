export interface User {
  ID: string;
  CreatedAt: Date;
  UpdatedAt: Date;
  Name: string;
  Email: string;
  ImageURL: string;
}

export interface UserAuthType {
  Email: string;
  Name: string;
  Picture: string;
}
