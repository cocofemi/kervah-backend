export interface IDailyTrivia {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    category: string;
}