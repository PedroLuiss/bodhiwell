import axios from 'axios';
import { NewsItem, MOCK_NEWS_DATA, } from '../types';

const API_URL = process.env.REACT_APP_BODHIWELL_BLOG_API_URL;

const USE_NEWS_CAROUSEL_MODE = process.env.REACT_APP_NEWS_CAROUSEL_MODE || 'api';

export const getNews = async (): Promise<NewsItem[]> => {
    if (!API_URL || API_URL === 'undefined') {
        return [];
    }

    try {
        if (USE_NEWS_CAROUSEL_MODE === 'mock') {
            await new Promise(resolve => setTimeout(resolve, 300));
            return MOCK_NEWS_DATA;
        }

        const response = await axios.get<NewsItem[]>(API_URL);

        return response.data;
    } catch (error) {
        return [];
    }
};