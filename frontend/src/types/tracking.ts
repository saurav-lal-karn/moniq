import { Transaction } from "./index";

export interface GoalContribution {
    id: string;
    goal_id: string;
    transaction_id?: string;
    amount: number;
    contribution_date: string;
    transaction?: Transaction;
}

export interface AddGoalContributionPayload {
    amount: number;
    transaction_id?: string;
    contribution_date?: string;
}

export interface DebtRepayment {
    id: string;
    debt_id: string;
    transaction_id?: string;
    amount: number;
    repayment_date: string;
    transaction?: Transaction;
}

export interface AddDebtRepaymentPayload {
    amount: number;
    transaction_id?: string;
    repayment_date?: string;
}

export interface InvestmentTransaction {
    id: string;
    investment_id: string;
    transaction_id?: string;
    type: "BUY" | "SELL" | "DIVIDEND";
    quantity: number;
    price_per_unit: number;
    transaction_date: string;
    transaction?: Transaction;
}

export interface AddInvestmentTransactionPayload {
    type: "BUY" | "SELL" | "DIVIDEND";
    quantity: number;
    price_per_unit: number;
    transaction_id?: string;
    transaction_date?: string;
}

export interface RecurringInstance {
    id: string;
    recurring_id: string;
    transaction_id?: string;
    execution_date: string;
    status: "SUCCESS" | "FAILED";
    error_message?: string;
    transaction?: Transaction;
}
