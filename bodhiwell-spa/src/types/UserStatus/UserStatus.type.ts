export type UserStatus = 'pending_completion' | 'pending_approval' | 'rejected' | 'active';

export interface UserStatusApiResponse {
    status: UserStatus;
    type_account: 'professional' | 'patient';
}