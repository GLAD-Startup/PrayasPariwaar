import { z } from "zod";

// ============================================================================
// Enums & Literals
// ============================================================================

export const BloodGroupValues = [
  "A_POSITIVE",
  "A_NEGATIVE",
  "B_POSITIVE",
  "B_NEGATIVE",
  "AB_POSITIVE",
  "AB_NEGATIVE",
  "O_POSITIVE",
  "O_NEGATIVE",
] as const;

export const BloodGroupDisplayMap: Record<string, string> = {
  A_POSITIVE: "A+",
  A_NEGATIVE: "A-",
  B_POSITIVE: "B+",
  B_NEGATIVE: "B-",
  AB_POSITIVE: "AB+",
  AB_NEGATIVE: "AB-",
  O_POSITIVE: "O+",
  O_NEGATIVE: "O-",
};

export const UrgencyLevelValues = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export const BloodRequestStatusValues = ["PENDING", "APPROVED", "FULFILLED", "CANCELLED"] as const;
export const EquipmentStatusValues = ["AVAILABLE", "LEASED", "MAINTENANCE"] as const;
export const UserRoleValues = ["ADMIN", "VOLUNTEER", "DONOR"] as const;
export const DonationStatusValues = ["PENDING", "SUCCESS", "FAILED"] as const;

// ============================================================================
// Auth Schemas
// ============================================================================

export const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const SignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().regex(/^[0-9+ -]{10,15}$/, "Please enter a valid phone number").optional().or(z.literal("")),
  role: z.enum(UserRoleValues).default("DONOR"),
  bloodGroup: z.enum(BloodGroupValues).optional(),
});
export type SignupInput = z.infer<typeof SignupSchema>;

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;

// ============================================================================
// Blood Request Schema (Shared Form Validation)
// ============================================================================

export const BloodRequestSchema = z.object({
  patientName: z.string().min(2, "Patient name is required (at least 2 chars)"),
  hospitalName: z.string().min(3, "Hospital name and ward/room is required"),
  city: z.string().min(2, "City / Location is required"),
  bloodGroup: z.enum(BloodGroupValues, {
    errorMap: () => ({ message: "Please select a valid blood group" }),
  }),
  unitsNeeded: z.coerce.number().int().min(1, "At least 1 unit is required").max(20, "Maximum 20 units per request"),
  urgency: z.enum(UrgencyLevelValues).default("HIGH"),
  contactPhone: z.string().min(10, "A valid 10-digit contact number is required"),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
});
export type BloodRequestInput = z.infer<typeof BloodRequestSchema>;

export const UpdateBloodRequestStatusSchema = z.object({
  status: z.enum(BloodRequestStatusValues),
});
export type UpdateBloodRequestStatusInput = z.infer<typeof UpdateBloodRequestStatusSchema>;

// ============================================================================
// Medical Equipment Request Schema
// ============================================================================

export const EquipmentRequestSchema = z.object({
  equipmentId: z.string().min(1, "Equipment ID is required"),
  requesterName: z.string().min(2, "Requester name is required"),
  contactPhone: z.string().min(10, "Valid contact number is required"),
  purpose: z.string().min(5, "Please describe the patient condition/purpose"),
  requestedDays: z.coerce.number().int().min(1, "Minimum 1 day").max(90, "Maximum 90 days at a time"),
  deliveryAddress: z.string().min(5, "Delivery address is required"),
});
export type EquipmentRequestInput = z.infer<typeof EquipmentRequestSchema>;

// ============================================================================
// Volunteer Application Schema
// ============================================================================

export const VolunteerSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email address is required"),
  phone: z.string().min(10, "Valid contact phone number is required"),
  skills: z.string().min(3, "Please specify your skills (e.g., Medical, Logistics, Teaching, IT)"),
  availability: z.string().min(3, "Availability details (e.g., Weekends, 4 hrs/week, Emergency on-call)"),
  areaOfInterest: z.string().min(3, "Area of interest (e.g., Blood Drive, Equipment Bank, Disaster Relief)"),
  previousExperience: z.string().optional(),
});
export type VolunteerInput = z.infer<typeof VolunteerSchema>;

// ============================================================================
// Donation & Payment Schemas
// ============================================================================

export const CreateDonationOrderSchema = z.object({
  amount: z.coerce.number().min(50, "Minimum donation amount is ₹50"),
  currency: z.string().default("INR"),
  donorName: z.string().min(2, "Donor name is required"),
  donorEmail: z.string().email("Valid email is required for 80G tax receipt"),
  donorPhone: z.string().min(10, "Valid phone is required"),
  projectOrCause: z.string().default("General Fund & Emergency Relief"),
});
export type CreateDonationOrderInput = z.infer<typeof CreateDonationOrderSchema>;

export const VerifyDonationWebhookSchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});
export type VerifyDonationWebhookInput = z.infer<typeof VerifyDonationWebhookSchema>;

// ============================================================================
// Push Token Registration Schema
// ============================================================================

export const RegisterPushTokenSchema = z.object({
  expoPushToken: z.string().min(10, "Valid Expo Push Token is required"),
  deviceType: z.string().optional().default("MOBILE"),
  userId: z.string().optional(),
});
export type RegisterPushTokenInput = z.infer<typeof RegisterPushTokenSchema>;

// ============================================================================
// Post / Article Schema
// ============================================================================

export const PostSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  slug: z.string().min(3, "Slug is required"),
  content: z.string().min(20, "Content must be at least 20 characters"),
  excerpt: z.string().max(300).optional(),
  coverImage: z.string().url().optional().or(z.literal("")),
  published: z.boolean().default(true),
});
export type PostInput = z.infer<typeof PostSchema>;
