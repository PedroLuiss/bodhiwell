/// <reference types="react-scripts" />

declare namespace NodeJS {
    interface ProcessEnv {
        readonly NODE_ENV: 'development' | 'production' | 'test';
        readonly PUBLIC_URL: string;
        readonly REACT_APP_NEWS_CAROUSEL_MODE?: string;
        readonly REACT_APP_API_URL?: string;
        readonly REACT_APP_BODHIWELL_BLOG_API_URL?: string;
        readonly REACT_APP_BODHIWELL_BLOG_API_SECRET?: string;
    }
}
