export interface ApiResponse<T> {
    status: string;
    data: T;
    code: number;
}

export interface Quiz {
    id: number;
    quiz_code: string;
    name: string;
    questions: Question[];
    created_at?: string;
    updated_at?: string;
    users: string;
    type?: Mark;
    score?: Score;
}

export interface QuizPostData {
    questions: string;  // This is a string representation of an array
    name: string;
}

export interface Question {
    id?: number;
    questionText: string;
    markScheme: string;
    marks: number;
    subject?: string;
    interface?: string;
    starter?: string;
    markingType?: string;
}

export interface Option {
    id?: number;
    text: string;
    isCorrect?: boolean;
}

export interface NavigationItem {
    name: string;
    id: number;
    icon?: any;
    current: boolean;
};

// Define a custom type for the context value
export interface TranslationContextValue {
    t: (key: string) => string;
};

// Mark and Score data types

export interface Mark extends Array<number> { }

export interface MarkData {
    0: string; // JSON.stringified array of marks
    1: string;
}

export interface Score {
    id?: number;
    name?: string;
    updated_at?: string;
    marks?: MarkData[];
    answers: string[];
    quiz_id?: number | undefined;
    user_name?: string;
    updated?: boolean;
}

export interface ProcessedScore {
    id: number;
    name: string;
    updated_at: string;
    total: number;
    outOf: number;
    attempted: number;
    status: "green" | "grey" | "yellow";
    quiz_id: number;
    user_name?: string;
}

export interface FullScore {
    question_number: number;
    answer: string;
    total: number;
    outOf: number;
    explanation: string;
    id: number;
    quiz_id: number;
}

export interface Insight {
    created_at?: string;
    id?: number;
    insight: string;
    quiz_id: number;
    updated_at?: string;
    user_id?: string;
};

export interface Course {
    id: number;
    name: string;
    topics: Topic[];
    created_at?: string;
    updated_at?: string;
}

export interface Topic {
    title: string;
    topicText?: string;
    video?: string;
    quiz?: string;
    questionText?: string;
    markScheme?: string;
    marks?: number;
    subject?: string;
    interface?: string;
}