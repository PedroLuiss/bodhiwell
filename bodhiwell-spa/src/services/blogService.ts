import axiosInstance from './axiosInstance';

export const blogService = {
    createPost: async (postData: {
        title: string;
        content: string;
        excerpt?: string;
        subtitle?: string;
        glossary_title?: string;
        glossary_intro?: string;
        glossary?: Array<{ term: string; description: string }>;
        sources_title?: string;
        sources_intro?: string;
        sources?: Array<{ label: string; content: string }>;
        image?: string | null;
        status?: string;
        category?: string;
    }) => {
        const response = await axiosInstance.post('/api/blog/post', postData);
        return response.data;
    },

    getPosts: async () => {
        const response = await axiosInstance.get('/api/blog/posts');
        return response.data;
    },

    updatePost: async (id: number, data: {
        title?: string;
        content?: string;
        excerpt?: string;
        subtitle?: string;
        glossary_title?: string;
        glossary_intro?: string;
        glossary?: Array<{ term: string; description: string }>;
        sources_title?: string;
        sources_intro?: string;
        sources?: Array<{ label: string; content: string }>;
        image?: string | null;
        status?: string;
        category?: string;
    }) => {
        const response = await axiosInstance.put(`/api/blog/post/${id}`, data);
        return response.data;
    },

    deletePost: async (id: number) => {
        const response = await axiosInstance.delete(`/api/blog/post/${id}`);
        return response.data;
    },
};
