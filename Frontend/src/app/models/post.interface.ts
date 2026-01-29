export interface Comment {
    id: string;
    userId: string;
    userName: string;
    message: string;
    createdAt: string;
    modified?: boolean;
}

export interface Post {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    titulo: string;
    mensaje: string;
    imageUrl?: string;
    likes: string[]; // array de userId que dieron like
    createdAt: string; // ISO
    deleted?: boolean; // baja lógica
    comments?: Comment[];
}
