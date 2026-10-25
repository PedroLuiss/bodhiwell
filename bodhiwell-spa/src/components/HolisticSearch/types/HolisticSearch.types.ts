
export interface BodhiIntent {
    key: string;
    dim: string;
    patterns: string[];
    boost?: string[];
}

export interface ScoredSpec {
    uid: string;
    dim: string;
    score: number;
    name: string;
}
