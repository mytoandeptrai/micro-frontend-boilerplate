export type MemberRole = "admin" | "member" | "viewer";
export type MemberStatus = "active" | "inactive";
export interface Member {
    id: string;
    name: string;
    email: string;
    role: MemberRole;
    avatar: string | null;
    status: MemberStatus;
    createdAt: string;
    updatedAt: string;
}
export interface CreateMemberPayload {
    name: string;
    email: string;
    role: MemberRole;
    avatar?: string;
}
export interface UpdateMemberPayload extends CreateMemberPayload {
    status?: MemberStatus;
}
