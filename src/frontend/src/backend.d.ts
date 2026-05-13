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
export interface ClassRecord {
    id: string;
    admin_id: UserId;
    name: string;
    description: string;
    created_at: Timestamp;
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
    dob?: string;
    joined_date: Timestamp;
    class: string;
    name: string;
    fee_start_date: Timestamp;
    section?: string;
    admission_date?: string;
    email: string;
    enrollment_number?: string;
    parent_phone?: string;
    address?: string;
    gender?: string;
    phone?: string;
    monthly_fee: bigint;
    course: string;
    parent_name?: string;
}
export interface UpdateClassForm {
    name: string;
    description: string;
}
export interface CreateSectionForm {
    name: string;
    class_id: string;
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
export interface SectionRecord {
    id: string;
    admin_id: UserId;
    name: string;
    created_at: Timestamp;
    class_id: string;
}
export interface CreateNotificationRequest {
    title: string;
    type: NotificationType;
    student_id?: UserId;
    message: string;
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
export interface Admin {
    id: UserId;
    created_at: Timestamp;
    institute_code: string;
    institute_name: string;
    address?: string;
    profile_id: UserId;
}
export interface CreateClassForm {
    name: string;
    description: string;
}
export interface UpdateStudentRequest {
    dob?: string;
    class?: string;
    name?: string;
    section?: string;
    admission_date?: string;
    email?: string;
    enrollment_number?: string;
    parent_phone?: string;
    address?: string;
    gender?: string;
    is_active?: boolean;
    phone?: string;
    monthly_fee?: bigint;
    course?: string;
    parent_name?: string;
}
export interface Student {
    id: string;
    dob?: string;
    updated_at: Timestamp;
    joined_date: Timestamp;
    admin_id: UserId;
    class: string;
    name: string;
    fee_start_date: Timestamp;
    section?: string;
    created_at: Timestamp;
    admission_date?: string;
    email: string;
    enrollment_number?: string;
    parent_phone?: string;
    address?: string;
    gender?: string;
    is_active: boolean;
    phone?: string;
    monthly_fee: bigint;
    course: string;
    profile_id?: UserId;
    parent_name?: string;
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
    createClass(form: CreateClassForm): Promise<ClassRecord>;
    createNotification(req: CreateNotificationRequest): Promise<Notification>;
    createProfile(req: CreateProfileRequest): Promise<Profile>;
    createSection(form: CreateSectionForm): Promise<SectionRecord>;
    createStudent(req: CreateStudentRequest): Promise<Student>;
    deleteClass(classId: string): Promise<boolean>;
    deletePayment(paymentId: string): Promise<boolean>;
    deleteSection(sectionId: string): Promise<boolean>;
    getAdminByProfile(): Promise<Admin | null>;
    getCallerUserRole(): Promise<UserRole>;
    getClassesByAdmin(): Promise<Array<ClassRecord>>;
    getMyProfile(): Promise<Profile | null>;
    getNotificationsByAdmin(): Promise<Array<Notification>>;
    getNotificationsByStudent(): Promise<Array<Notification>>;
    getPaymentsByAdmin(): Promise<Array<MonthlyPayment>>;
    getPaymentsByStudent(): Promise<Array<MonthlyPayment>>;
    getSectionsByAdmin(): Promise<Array<SectionRecord>>;
    getSectionsByClass(classId: string): Promise<Array<SectionRecord>>;
    getStudentByProfile(): Promise<Student | null>;
    getStudentsByAdmin(): Promise<Array<Student>>;
    isCallerAdmin(): Promise<boolean>;
    markAllNotificationsRead(): Promise<bigint>;
    markNotificationRead(notifId: string): Promise<boolean>;
    recordPayment(req: RecordPaymentRequest): Promise<MonthlyPayment>;
    updateClass(classId: string, form: UpdateClassForm): Promise<ClassRecord | null>;
    updatePayment(paymentId: string, req: UpdatePaymentRequest): Promise<MonthlyPayment | null>;
    updateProfile(req: UpdateProfileRequest): Promise<Profile | null>;
    updateStudent(studentId: string, req: UpdateStudentRequest): Promise<Student | null>;
}
