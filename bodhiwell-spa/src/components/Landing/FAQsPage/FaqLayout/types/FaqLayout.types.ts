export interface FaqItem {
    q: string;
    a: string;
}

export interface FaqGroup {
    id: string;
    title: string;
    intro: string;
    items: FaqItem[];
}

export interface FaqLayoutProps {
    faqGroups: FaqGroup[];
}