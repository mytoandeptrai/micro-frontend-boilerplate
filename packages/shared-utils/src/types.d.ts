export type BaseResponseType<T> = {
    success: boolean;
    statusCode: number;
    data: T;
    timestamp: string;
    message?: string;
};
export type PaginatedMeta = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};
export type PaginatedResponseType<T> = BaseResponseType<{
    data: T[];
    meta: PaginatedMeta;
}>;
