import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UpdatePaymentRequest {
    payment_date?: Timestamp;
    payment_method?: PaymentMethod;
    amount_paid?: bigint;
    notes?: string;
}
export type Timestamp = bigint;
export interface RecordPaymentRequest {
    month: string;
    payment_date: Timestamp;
    student_id: string;
    payment_method: PaymentMethod;
    amount_paid: bigint;
    notes?: string;
}
export interface MonthlyPayment {
    id: string;
    month: string;
    payment_date: Timestamp;
    admin_id: UserId;
    student_id: string;
    created_at: Timestamp;
    payment_method: PaymentMethod;
    amount_paid: bigint;
    notes?: string;
}
export interface CreateProfileRequest {
    avatar_url?: string;
    name: string;
    role: Role;
    email: string;
    phone?: string;
}
export interface Profile {
    id: UserId;
    updated_at: Timestamp;
    avatar_url?: string;
    name: string;
    role: Role;
    created_at: Timestamp;
    email: string;
    is_active: boolean;
    phone?: string;
}
export interface CreateStudentRequest {
    joined_date: Timestamp;
    class: string;
    name: string;
    fee_start_date: Timestamp;
    email: string;
    monthly_fee: bigint;
    course: string;
}
export interface CreateAdminRequest {
    institute_code: string;
    institute_name: string;
    address?: string;
}
export type UserId = string;
export interface UpdateProfileRequest {
    avatar_url?: string;
    name?: string;
    email?: string;
    is_active?: boolean;
    phone?: string;
}
export interface CreateNotificationRequest {
    title: string;
    type: NotificationType;
    student_id?: UserId;
    message: string;
}
export interface Admin {
    id: UserId;
    created_at: Timestamp;
    institute_code: string;
    institute_name: string;
    address?: string;
    profile_id: UserId;
}
export interface Notification {
    id: string;
    is_read: boolean;
    title: string;
    admin_id: UserId;
    type: NotificationType;
    student_id?: UserId;
    created_at: Timestamp;
    message: string;
}
export interface UpdateStudentRequest {
    class?: string;
    name?: string;
    email?: string;
    is_active?: boolean;
    monthly_fee?: bigint;
    course?: string;
}
export interface Student {
    id: string;
    updated_at: Timestamp;
    joined_date: Timestamp;
    admin_id: UserId;
    class: string;
    name: string;
    fee_start_date: Timestamp;
    created_at: Timestamp;
    email: string;
    is_active: boolean;
    monthly_fee: bigint;
    course: string;
    profile_id?: UserId;
}
export enum NotificationType {
    custom = "custom",
    fee_due = "fee_due",
    overdue = "overdue",
    payment_received = "payment_received"
}
export enum PaymentMethod {
    card = "card",
    cash = "cash",
    cheque = "cheque",
    online = "online"
}
export enum Role {
    admin = "admin",
    student = "student"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createAdmin(req: CreateAdminRequest): Promise<Admin>;
    createNotification(req: CreateNotificationRequest): Promise<Notification>;
    createProfile(req: CreateProfileRequest): Promise<Profile>;
    createStudent(req: CreateStudentRequest): Promise<Student>;
    deletePayment(paymentId: string): Promise<boolean>;
    getAdminByProfile(): Promise<Admin | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMyProfile(): Promise<Profile | null>;
    getNotificationsByAdmin(): Promise<Array<Notification>>;
    getNotificationsByStudent(): Promise<Array<Notification>>;
    getPaymentsByAdmin(): Promise<Array<MonthlyPayment>>;
    getPaymentsByStudent(): Promise<Array<MonthlyPayment>>;
    getStudentByProfile(): Promise<Student | null>;
    getStudentsByAdmin(): Promise<Array<Student>>;
    isCallerAdmin(): Promise<boolean>;
    markAllNotificationsRead(): Promise<bigint>;
    markNotificationRead(notifId: string): Promise<boolean>;
    recordPayment(req: RecordPaymentRequest): Promise<MonthlyPayment>;
    updatePayment(paymentId: string, req: UpdatePaymentRequest): Promise<MonthlyPayment | null>;
    updateProfile(req: UpdateProfileRequest): Promise<Profile | null>;
    updateStudent(studentId: string, req: UpdateStudentRequest): Promise<Student | null>;
}
