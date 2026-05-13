export interface AdminProfile {
  name: string;
  email: string;
  phone?: string;
  instituteName: string;
  instituteCode: string;
  address?: string;
}

export interface AppSettings {
  theme: "dark" | "light";
  adminProfile: AdminProfile;
}
