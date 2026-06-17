import {
    DebtRepayment,
    GoalContribution,
    InvestmentTransaction,
    RecurringInstance,
} from "./tracking";

export * from "./tracking";

export interface Family {
    id: string;
    name: string;
    currency: string;
    locale: string;
    budgetAlerts: boolean;
    weeklyReport: boolean;
    hidePortfolio: boolean;
    restrictDeletion: boolean;
    hideIncome: boolean;
}

export interface FamilySettings {
    id: string;
    name: string;
    currency: string;
    budgetAlerts: boolean;
    weeklyReport: boolean;
    hidePortfolio: boolean;
    restrictDeletion: boolean;
}

export interface UpdateFamilySettingsPayload {
    name: string;
    currency: string;
    budgetAlerts: boolean;
    weeklyReport: boolean;
    hidePortfolio: boolean;
    restrictDeletion: boolean;
}

export interface InviteMemberPayload {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    familyId?: string;
}

export interface FamilyMember {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    created_at: string;
    status: string;
    avatar_url: string;
}

export interface FamilyStats {
    total_members: number;
    total_administrators: number;
    total_active_now: number;
    total_pending_invites: number;
    total_amount: number;
    total_ledgers: number;
    total_users: number;
    total_transactions: number;
}

export interface ExpenseStats {
    title: string;
    value: string;
    subtitle?: string;
    icon: React.ReactNode;
    bg: string;
    color: string;
    change?: string;
    isPositive?: boolean;
}

export interface ExpenseStatsResponse {
    total_expenses: number;
    total_amount: number;
    this_month: number;
    last_month: number;
    average_expense: number;
}

// Unified Transaction Types
export type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER";

export interface TransactionCategory {
    id: string;
    name: string;
    type: TransactionType;
    icon_name?: string;
    color?: string;
    parent_id?: string;
    family_id?: string;
    is_system: boolean;
    is_active: boolean;
    created_at: string;
}

export type ExpenseCategory = TransactionCategory;
export type IncomeType = TransactionCategory;

export interface PaymentMethod {
    id: string;
    name: string;
    description: string;
    icon_name: string;
    is_system: boolean;
    family_id: string;
    created_by_id: string;
}

// Phase 4: Contacts & Organization Types
export type ContactType = "VENDOR" | "LENDER" | "EMPLOYER" | "OTHER";

export interface Contact {
    id: string;
    family_id: string;
    user_id?: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    notes?: string;
    type: ContactType;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateContactPayload {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    type: ContactType;
    family_id: string;
}

export interface FinancialInstitution {
    id: string;
    family_id: string;
    name: string;
    code?: string;
    website?: string;
    created_at: string;
    updated_at: string;
}

export interface Tag {
    id: string;
    family_id: string;
    name: string;
    color?: string;
    created_at: string;
}

export interface Project {
    id: string;
    family_id: string;
    name: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Location {
    id: string;
    name: string;
    latitude?: number;
    longitude?: number;
    address?: string;
    created_at: string;
}

export interface TransactionItem {
    id: string;
    transaction_id: string;
    name: string;
    amount: number;
    quantity: number;
    unit_price: number;
    category_id?: string;
    category?: TransactionCategory;
}

export interface Transaction {
    id: string;
    type: TransactionType;
    amount: number;
    title: string;
    description: string;
    transaction_date: string;
    wallet_id: string;
    category_id?: string;
    payment_method_id?: string;
    contact_id?: string;
    location_id?: string;
    project_id?: string;
    family_id: string;
    created_by_id: string;
    tags?: string[];
    attachments?: string[];
    file_id?: string;
    items?: TransactionItem[];
    created_at: string;
    updated_at: string;

    // Associations
    wallet?: WalletInfoType;
    category?: TransactionCategory;
    payment_method?: PaymentMethod;
    contact?: Contact;
    location?: Location;
    project?: Project;
}

export interface CustomValueCreationPayload {
    id: string;
    value: string;
}

export interface CreateTransactionPayload {
    type: TransactionType;
    title: string;
    amount: number;
    description: string;
    transaction_date: string;
    wallet_id: string;
    family_id: string;
    tags?: string[];
    attachments?: string[];
    file_id?: string;
    category_id: string;
    payment_method_id: string;
    contact_id: string;
    location_id: string;
    project_id: string;
    category: CustomValueCreationPayload;
    payment_method: CustomValueCreationPayload;
    contact: CustomValueCreationPayload;
    location: CustomValueCreationPayload;
    project: CustomValueCreationPayload;
    items?: Partial<TransactionItem>[];
}

export interface BulkImportTransactionItem {
    type: TransactionType;
    amount: number;
    title: string;
    description: string;
    wallet_name: string;
    category_name: string;
    payment_method_name?: string;
    vendor_name?: string;
    project_name?: string;
    location_name?: string;
    transaction_date: string;
    family_id: string;
    tags?: string[];
    items?: Array<{
        name: string;
        amount: number;
        quantity: number;
        unit_price: number;
    }>;
}

export interface TransactionListResponse {
    transactions: Transaction[];
    total_count: number;
    page: number;
    page_size: number;
}

// Types for wallet types
export interface WalletType {
    id: string;
    name: string;
    description: string;
    is_system: boolean;
    family_id: string;
    created_by_id: string;
}

// Types for wallets
export interface CreateWalletPayload {
    name: string;
    starting_balance: number;
    currency: string;
    provider_wallet_id: string;
    wallet_issuer_name: string;
    wallet_type_id: string;
    description: string;
    is_custom_type: boolean;
    custom_type_name: string;
    custom_type_description: string;
    family_id: string;
}

export interface WalletInfoType {
    id: string;
    name: string;
    starting_balance: number;
    balance: number;
    currency: string;
    description: string;
    wallet_issuer_name: string;
    provider_wallet_id: string;
    wallet_type_id: string;
    user_id: string;
    family_id: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    wallet_type: WalletType;
}

export interface WalletListResponse {
    wallets: WalletInfoType[];
    total_count: number;
    page: number;
    page_size: number;
}

export interface CreateWalletTransferPayload {
    from_wallet_id: string;
    to_wallet_id: string;
    amount: number;
    date: string;
    remarks: string;
    family_id: string;
}

export interface WalletTransfer {
    id: string;
    from_wallet_id: string;
    to_wallet_id: string;
    amount: number;
    date: string;
    remarks: string;
    user_id: string;
    family_id: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    from_wallet: WalletInfoType;
    to_wallet: WalletInfoType;
}

// Types for income types
// IncomeType is now an alias for TransactionCategory

export interface CreateGoalPayload {
    name: string;
    target_amount: number;
    current_amount: number;
    description: string;
    icon_name: string;
    deadline: string;
    family_id: string;
}

export interface Goal {
    id: string;
    name: string;
    current_amount: number;
    target_amount: number;
    description: string;
    icon_name: string;
    color: string;
    deadline: string;
    family_id: string;
    creator_id: string;
    created_at: string;
    updated_at: string;
    contributions?: GoalContribution[];
}

export interface CreateBudgetPayload {
    category_id: string;
    amount_limit: number;
    family_id: string;
    period: string;
    alert_threshold: number;
}

export interface Budget {
    id: string;
    category_id: string;
    amount_limit: number;
    family_id: string;
    period: string;
    alert_threshold: number;
    created_at: string;
    updated_at: string;
    category: ExpenseCategory;
    // Calculated fields based on usage/logic (for future implementation or if backend sends them)
    // For now we assume the frontend might calculate spent from expenses list OR backend sends it
    // Based on budget.go model, these aren't there, so we might need to fetch expenses to calc 'spent'.
    // To keep it simple, let's assume for now we only get the config.
    // Wait, the UI shows 'spent'. I'll need to calculate that or ask backend to send it.
    // Backend model doesn't seem to have 'spent' or 'current_amount'.
    // I will check if backend sends 'spent'. If not, I will just put the interface as is.
    // The previous mockup had 'spent'.
}

export interface Debt {
    id: string;
    family_id: string;
    user_id: string;
    lender: string;
    lender_contact_id?: string;
    total_amount: number;
    remaining_amount: number;
    interest_rate: number;
    due_date: string;
    created_at: string;
    updated_at: string;
    repayments?: DebtRepayment[];
    lender_contact?: Contact;
}

export interface CreateDebtPayload {
    family_id?: string;
    lender: string;
    lender_contact_id?: string;
    total_amount: number;
    remaining_amount: number;
    interest_rate: number;
    due_date: string;
}

export interface Investment {
    id: string;
    family_id: string;
    user_id: string;
    name: string;
    type: string;
    quantity: number;
    avg_buy_price: number;
    current_price: number;
    created_at: string;
    updated_at: string;
    transactions?: InvestmentTransaction[];
}

export interface CreateInvestmentPayload {
    family_id?: string;
    name: string;
    type: string;
    quantity: number;
    avg_buy_price: number;
    current_price: number;
}

export interface RecurringTransaction {
    id: string;
    family_id: string;
    user_id: string;
    name: string;
    amount: number;
    frequency: string;
    next_due_date: string;
    type: string;
    created_at: string;
    updated_at: string;
    instances?: RecurringInstance[];
}

export interface CreateRecurringTransactionPayload {
    family_id?: string;
    name: string;
    amount: number;
    frequency: string;
    next_due_date: string;
    type: string;
}

export interface TaxDocument {
    id: string;
    family_id: string;
    name: string;
    category: string;
    year: string;
    file_url?: string;
    remarks?: string;
    created_at: string;
}

export interface CreateTaxDocumentPayload {
    family_id?: string;
    name: string;
    category: string;
    year: string;
    file_url?: string;
    remarks?: string;
}

export interface TaxDeduction {
    id: string;
    family_id: string;
    name: string;
    amount: number;
    max_limit: number;
    category: string;
    year: string;
}

// Phase 5: Insurance & Subscriptions
export type InsurancePolicyType =
    | "LIFE"
    | "HEALTH"
    | "MOTOR"
    | "TRAVEL"
    | "PROPERTY"
    | "OTHER";
export type InsurancePolicyStatus =
    | "ACTIVE"
    | "EXPIRED"
    | "LAPSED"
    | "CANCELLED";
export type RecurringFrequency =
    | "DAILY"
    | "WEEKLY"
    | "BIWEEKLY"
    | "MONTHLY"
    | "QUARTERLY"
    | "YEARLY";

export interface InsurancePolicy {
    id: string;
    family_id: string;
    contact_id?: string;
    policy_name: string;
    policy_number?: string;
    type: InsurancePolicyType;
    status: InsurancePolicyStatus;
    premium_amount: number;
    premium_frequency: RecurringFrequency;
    sum_assured: number;
    start_date: string;
    end_date?: string;
    next_due_date?: string;
    provider?: Contact;
}

export interface CreateInsurancePolicyPayload {
    policy_name: string;
    policy_number?: string;
    type: InsurancePolicyType;
    premium_amount: number;
    premium_frequency: RecurringFrequency;
    sum_assured: number;
    start_date: string;
    end_date?: string;
    contact_id?: string;
}

export type SubscriptionStatus = "ACTIVE" | "PAUSED" | "CANCELLED";

export interface Subscription {
    id: string;
    family_id: string;
    name: string;
    amount: number;
    frequency: RecurringFrequency;
    category_id?: string;
    wallet_id?: string;
    vendor_id?: string;
    next_billing_date?: string;
    start_date: string;
    status: SubscriptionStatus;
    category?: TransactionCategory;
    wallet?: WalletInfoType;
    vendor?: Contact;
}

export interface CreateSubscriptionPayload {
    name: string;
    amount: number;
    frequency: RecurringFrequency;
    category_id?: string;
    wallet_id?: string;
    vendor_id?: string;
    start_date: string;
    next_billing_date?: string;
    family_id: string;
}

// Phase 6: Split Expenses & Advanced Tracking
export type SplitMethod = "EQUAL" | "PERCENTAGE" | "EXACT";

export interface ExpenseSplit {
    id: string;
    transaction_id: string;
    total_amount: number;
    split_method: SplitMethod;
    participants: SplitParticipant[];
}

export interface SplitParticipant {
    id: string;
    user_id?: string;
    contact_id?: string;
    amount_owed: number;
    amount_paid: number;
    status: "UNPAID" | "PARTIAL" | "SETTLED";
    user?: FamilyMember;
    contact?: Contact;
}

export interface Attachment {
    id: string;
    family_id: string;
    file_name: string;
    file_path: string;
    file_type?: string;
    file_size?: number;
    entity_type: string;
    entity_id: string;
    uploaded_by?: string;
    created_at: string;
}

export interface CreateTaxDeductionPayload {
    family_id?: string;
    name: string;
    amount: number;
    max_limit: number;
    category: string;
    year: string;
}
