export interface PublicationAuthor {
    _id: string;
    username: string;
    profileImage?: string;
}

export interface Publication {
    _id: string;
    title: string;
    message: string;
    imageUrl?: string;
    author?: PublicationAuthor;
    likes?: string[];
    createdAt: string;
    commentsCount?: number;
    isDeleted?: boolean;
}

export interface PublicationsResponse {
    data: Publication[];
    total: number;
    page: number;
    limit: number;
}