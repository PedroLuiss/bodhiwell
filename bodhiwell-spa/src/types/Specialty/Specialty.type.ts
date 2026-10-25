export interface Dimension {
    uid: string;
    name: string;
    slug: string;
    colorCode: string;
}

export interface Specialty {
    uid: string;
    name: string;
    slug: string;
    dimension: Dimension;
    requires_msp: boolean;
    can_be_main_profession: boolean;
    masculine_title: string;
    feminine_title: string;
    neutral_title: string;
    description?: string;
}