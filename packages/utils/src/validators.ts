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

export const ProjectCategoryValues = [
  "EDUCATION",
  "AWARENESS",
  "HEALTH",
  "PLANTATION",
  "OTHER",
] as const;
export const ProjectStatusValues = ["UPCOMING", "ACTIVE", "COMPLETED"] as const;

// Helper to format Zod error to readable string
export function formatZodError(error: z.ZodError): string {
  const fieldErrors = error.flatten().fieldErrors;
  const messages = Object.entries(fieldErrors)
    .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(", ")}`)
    .filter(Boolean);
  return messages.length > 0 ? messages.join(" • ") : "Invalid input data";
}

// ============================================================================
// Auth Schemas
// ============================================================================

export const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(4, "Password must be at least 4 characters"),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const SignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(4, "Password must be at least 4 characters"),
  phone: z.string().optional().or(z.literal("")),
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
  hospitalName: z.string().min(2, "Hospital name is required"),
  city: z.string().min(2, "City / Location is required"),
  bloodGroup: z.enum(BloodGroupValues, {
    errorMap: () => ({ message: "Please select a valid blood group" }),
  }),
  unitsNeeded: z.coerce.number().int().min(1, "At least 1 unit is required").max(50, "Maximum 50 units per request"),
  urgency: z.enum(UrgencyLevelValues).default("HIGH"),
  contactPhone: z.string().min(7, "A valid contact number is required"),
  notes: z.string().max(1000, "Notes cannot exceed 1000 characters").optional().nullable(),
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
  contactPhone: z.string().min(7, "Valid contact number is required"),
  purpose: z.string().min(2, "Please describe the patient condition or purpose"),
  requestedDays: z.coerce.number().int().min(1, "Minimum 1 day").max(365, "Maximum 365 days"),
  deliveryAddress: z.string().min(3, "Delivery address is required"),
});
export type EquipmentRequestInput = z.infer<typeof EquipmentRequestSchema>;

// ============================================================================
// Volunteer Application Schema
// ============================================================================

export const VolunteerSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email address is required"),
  phone: z.string().min(7, "Valid contact phone number is required"),
  skills: z.string().min(1, "Please specify your skills (e.g. Teaching, Logistics, Medical)"),
  availability: z.string().min(1, "Please specify your availability"),
  areaOfInterest: z.string().min(1, "Please specify your area of interest"),
  previousExperience: z.string().optional().nullable(),
});
export type VolunteerInput = z.infer<typeof VolunteerSchema>;

// ============================================================================
// Donation & Payment Schemas
// ============================================================================

export const CreateDonationOrderSchema = z.object({
  amount: z.coerce.number().min(1, "Minimum donation amount is ₹1"),
  currency: z.string().default("INR"),
  donorName: z.string().min(2, "Donor name is required"),
  donorEmail: z.string().email("Valid email is required for 80G tax receipt"),
  donorPhone: z.string().min(7, "Valid phone is required"),
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

export const PostTypeValues = ["EVENT", "NEWS", "ACHIEVEMENT", "ANNOUNCEMENT"] as const;

export const PostSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  slug: z.string().min(1, "Slug is required"),
  content: z.string().min(5, "Content must be at least 5 characters"),
  excerpt: z.string().max(500).optional().nullable(),
  type: z.enum(PostTypeValues).default("EVENT"),
  eventDate: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  coverImage: z.string().optional().nullable().or(z.literal("")),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  published: z.boolean().default(true),
  imageUrls: z.array(z.string()).optional(),
});
export type PostInput = z.infer<typeof PostSchema>;

// ============================================================================
// Project Schema
// ============================================================================

export const ProjectSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  slug: z.string().min(1, "Slug is required"),
  category: z.enum(ProjectCategoryValues).default("EDUCATION"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  goalAmount: z.coerce.number().min(0).default(0),
  coverImage: z.string().optional().nullable().or(z.literal("")),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  status: z.enum(ProjectStatusValues).default("ACTIVE"),
});
export type ProjectInput = z.infer<typeof ProjectSchema>;
