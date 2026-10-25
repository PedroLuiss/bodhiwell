export type BlogStatus = "publish" | "draft" | "trash";

export interface BlogPost {
    uid: string | number;
    id: number;
    title: string;
    date: string;
    link: string;
    excerpt: string;
    content: string;
    image: string;
    status: BlogStatus;
}
