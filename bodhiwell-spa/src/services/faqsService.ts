import { FAQS_MOCK } from '../utils/mooks/faqs.mock';
import { FaqGroup } from '../components/Landing/FAQsPage/FaqLayout/types';

export const getFaqs = async (): Promise<FaqGroup[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(FAQS_MOCK);
        }, 1000);
    });
};
