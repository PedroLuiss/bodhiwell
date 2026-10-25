export interface ContactRequest {
  fullName: string;
  email: string;
  message: string;
}

export interface ContactResponse {
  message: string;
  uid: string;
}