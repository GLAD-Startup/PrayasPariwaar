import { prisma } from "@/lib/prisma";
import { sendExpoPushNotification, ExpoPushMessage } from "./expo-push";
import { NotificationType, BloodGroup } from "@prisma/client";

/**
 * Extracts the last 10 digits of a phone number for resilient matching
 */
function normalizePhone(rawPhone?: string | null): string {
  if (!rawPhone) return "";
  return rawPhone.replace(/\D/g, "").slice(-10);
}

/**
 * Strips HTML tags and collapses spaces for clean push notification previews
 */
function cleanTextSnippet(text?: string | null, maxLength = 135): string {
  if (!text) return "";
  const cleaned = text
    .replace(/<[^>]*>?/gm, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.substring(0, maxLength).trim() + "...";
}

/**
 * Finds all active Expo push tokens for a specific user ID or contact phone
 */
async function findTokensForUserOrPhone(
  userId?: string | null,
  rawPhone?: string | null,
  email?: string | null
): Promise<{ tokens: string[]; matchedUserId: string | null }> {
  let matchedUserId = userId || null;
  const tokenSet = new Set<string>();

  // 1. Direct user token lookup
  if (matchedUserId) {
    const userTokens = await prisma.pushToken.findMany({
      where: { userId: matchedUserId },
      select: { expoPushToken: true },
    });
    userTokens.forEach((t) => tokenSet.add(t.expoPushToken));
  }

  // 2. Lookup user by phone or email if not resolved
  const cleanPhone = normalizePhone(rawPhone);
  if (!matchedUserId && (cleanPhone || email)) {
    const matchedUser = await prisma.user.findFirst({
      where: {
        OR: [
          ...(cleanPhone ? [{ phone: { contains: cleanPhone } }] : []),
          ...(email ? [{ email: { equals: email, mode: "insensitive" as const } }] : []),
        ],
      },
      select: { id: true },
    });
    if (matchedUser) {
      matchedUserId = matchedUser.id;
      const userTokens = await prisma.pushToken.findMany({
        where: { userId: matchedUserId },
        select: { expoPushToken: true },
      });
      userTokens.forEach((t) => tokenSet.add(t.expoPushToken));
    }
  }

  return {
    tokens: Array.from(tokenSet).filter(Boolean),
    matchedUserId,
  };
}

/**
 * 1. BROADCAST: Triggered when a new Blog / Field Dispatch is published
 */
export async function broadcastNewDispatchNotification(post: {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  location?: string | null;
  authorId?: string | null;
}) {
  try {
    const allTokens = await prisma.pushToken.findMany({
      select: { expoPushToken: true, userId: true },
      take: 1000,
    });

    const uniqueTokens: string[] = Array.from(
      new Set(allTokens.map((t: any) => t.expoPushToken).filter(Boolean) as string[])
    );
    if (uniqueTokens.length === 0) {
      console.log("[NotificationsHub] No active push tokens registered for dispatch broadcast.");
      return;
    }

    const title = `📰 New Seva Dispatch • ${cleanTextSnippet(post.title, 55)}`;
    const body = cleanTextSnippet(
      post.excerpt || post.content || "Read the latest authentic on-ground seva update from Vrindavan & Mathura.",
      140
    );

    // Dispatch Push Notification to all devices
    await sendExpoPushNotification({
      to: uniqueTokens,
      title,
      body,
      sound: "default",
      priority: "high",
      channelId: "general_announcements",
      data: {
        type: "DISPATCH",
        postId: post.id,
        slug: post.slug,
        route: `/blog/${post.slug}`,
      },
    });

    // Record in global Notification History
    await prisma.notification.create({
      data: {
        title,
        body,
        type: "EVENT",
        relatedPostId: post.id,
        recipientCount: uniqueTokens.length,
        createdById: post.authorId || null,
      },
    });

    console.log(`[NotificationsHub] Dispatched blog broadcast for "${post.title}" to ${uniqueTokens.length} devices.`);
  } catch (error: any) {
    console.error("[NotificationsHub] Failed to broadcast dispatch notification:", error);
  }
}

/**
 * 2. MEDICAL REQUEST STATUS UPDATE: Triggered on borrower status changes
 */
export async function sendMedicalRequestStatusNotification(
  request: {
    id: string;
    requesterId?: string | null;
    requesterName?: string | null;
    contactPhone?: string | null;
    equipment?: { name?: string } | null;
    equipmentId?: string | null;
  },
  newStatus: string
) {
  try {
    const equipName = request.equipment?.name || "Medical Equipment";
    let title = "";
    let body = "";
    let notifType: NotificationType = "EQUIPMENT_UPDATE";

    switch (newStatus.toUpperCase()) {
      case "APPROVED":
        title = "🩺 Medical Equipment Approved • Ready for Pickup";
        body = `Your loan request for ${equipName} has been approved. Please visit our Raman Reti Seva Desk or call +91 99270 81650 for dispatch coordination.`;
        break;
      case "ACTIVE":
      case "DISPATCHED":
        title = "🚚 Medical Equipment Dispatched • Active Seva Loan";
        body = `Your ${equipName} is active and dispatched for patient recovery. Prayas Seva Desk (+91 99270 81650) is available 24/7 for oxygen/bed support.`;
        break;
      case "RETURNED":
      case "COMPLETED":
        title = "✅ Medical Equipment Returned • Seva Cycle Complete";
        body = `Thank you for safely returning ${equipName}. Your prompt return allows another critical patient in Mathura-Vrindavan to receive life-saving care.`;
        break;
      case "REJECTED":
        title = "Update on Medical Equipment Request • Prayas Desk";
        body = `We are currently unable to allocate ${equipName} due to inventory availability. Please reach out to helpline: +91 99270 81650 for emergency alternatives.`;
        break;
      default:
        title = `📋 Medical Request Status: ${newStatus}`;
        body = `Your loan request for ${equipName} has been updated to status: ${newStatus}.`;
    }

    const { tokens, matchedUserId } = await findTokensForUserOrPhone(
      request.requesterId,
      request.contactPhone
    );

    if (tokens.length > 0) {
      await sendExpoPushNotification({
        to: tokens,
        title,
        body,
        sound: "default",
        priority: "high",
        channelId: "emergency_alerts",
        data: {
          type: "EQUIPMENT_UPDATE",
          requestId: request.id,
          status: newStatus,
          equipmentName: equipName,
          route: "/medical-request",
        },
      });
    }

    if (matchedUserId) {
      await prisma.userNotification.create({
        data: {
          userId: matchedUserId,
          title,
          message: body,
          type: notifType,
          isRead: false,
          linkUrl: "/medical-request",
        },
      });
    }

    console.log(`[NotificationsHub] Sent medical status (${newStatus}) push to ${tokens.length} devices.`);
  } catch (error: any) {
    console.error("[NotificationsHub] Failed to send medical request push notification:", error);
  }
}

/**
 * 3. VOLUNTEER STATUS UPDATE: Triggered when volunteer profile changes status
 */
export async function sendVolunteerStatusNotification(
  volunteer: {
    id: string;
    userId?: string | null;
    name: string;
    phone?: string | null;
    email?: string | null;
  },
  newStatus: string
) {
  try {
    let title = "";
    let body = "";

    switch (newStatus.toUpperCase()) {
      case "APPROVED":
      case "ACTIVE":
        title = "🌿 Welcome to Prayas Seva Taskforce • Confirmed";
        body = `Namaste ${volunteer.name}! Your volunteer registration has been confirmed. Thank you for joining our selfless seva mission in Braj.`;
        break;
      case "PENDING":
      case "UNDER_REVIEW":
        title = "📋 Volunteer Application Under Review • Prayas Sanstha";
        body = `Namaste ${volunteer.name}, your volunteer application is under active review by our field coordination team.`;
        break;
      case "REJECTED":
        title = "Volunteer Application Update • Prayas Sanstha";
        body = `Namaste ${volunteer.name}, thank you for your willingness to serve. We are unable to onboard new volunteers in this stream at present.`;
        break;
      default:
        title = `📋 Volunteer Status Update: ${newStatus}`;
        body = `Namaste ${volunteer.name}, your volunteer profile status has been updated to ${newStatus}.`;
    }

    const { tokens, matchedUserId } = await findTokensForUserOrPhone(
      volunteer.userId,
      volunteer.phone,
      volunteer.email
    );

    if (tokens.length > 0) {
      await sendExpoPushNotification({
        to: tokens,
        title,
        body,
        sound: "default",
        priority: "high",
        channelId: "volunteer_updates",
        data: {
          type: "VOLUNTEER_UPDATE",
          volunteerId: volunteer.id,
          status: newStatus,
          route: "/notifications",
        },
      });
    }

    if (matchedUserId) {
      await prisma.userNotification.create({
        data: {
          userId: matchedUserId,
          title,
          message: body,
          type: "VOLUNTEER_UPDATE",
          isRead: false,
          linkUrl: "/notifications",
        },
      });
    }

    console.log(`[NotificationsHub] Sent volunteer status (${newStatus}) push to ${tokens.length} devices.`);
  } catch (error: any) {
    console.error("[NotificationsHub] Failed to send volunteer status push notification:", error);
  }
}

/**
 * 4. DONATION CONFIRMATION: Triggered on verified donation from app or web
 */
export async function sendDonationConfirmedNotification(
  donation: {
    id: string;
    userId?: string | null;
    donorName?: string | null;
    donorPhone?: string | null;
    donorEmail?: string | null;
    amount: number;
    projectOrCause?: string | null;
    receiptNumber?: string | null;
  },
  extra?: {
    expoPushToken?: string | null;
  }
) {
  try {
    const donorName = donation.donorName || "Dedicated Supporter";
    const cause = donation.projectOrCause || "General Seva Fund";
    const receipt = donation.receiptNumber || `PRY-${Date.now().toString().slice(-6)}`;
    const formattedAmount = `₹${donation.amount.toLocaleString("en-IN")}`;

    const title = `💚 Contribution Confirmed • 80G Tax-Exempt Receipt`;
    const body = `Thank you, ${donorName}! Your contribution of ${formattedAmount} for ${cause} is confirmed (Receipt #${receipt}). Official 80G receipt issued with heartfelt gratitude from Vrindavan.`;

    const { tokens, matchedUserId } = await findTokensForUserOrPhone(
      donation.userId,
      donation.donorPhone,
      donation.donorEmail
    );

    // If explicit client token was passed from mobile checkout, ensure it's included
    if (extra?.expoPushToken && !tokens.includes(extra.expoPushToken)) {
      tokens.push(extra.expoPushToken);
    }

    if (tokens.length > 0) {
      await sendExpoPushNotification({
        to: tokens,
        title,
        body,
        sound: "default",
        priority: "high",
        channelId: "donation_receipts",
        data: {
          type: "DONATION_RECEIPT",
          donationId: donation.id,
          receiptNumber: receipt,
          amount: donation.amount,
          cause,
          route: "/my-donations",
        },
      });
    }

    if (matchedUserId) {
      await prisma.userNotification.create({
        data: {
          userId: matchedUserId,
          title,
          message: body,
          type: "DONATION_RECEIPT",
          isRead: false,
          linkUrl: "/my-donations",
        },
      });
    }

    console.log(`[NotificationsHub] Sent donation receipt push to ${tokens.length} devices.`);
  } catch (error: any) {
    console.error("[NotificationsHub] Failed to send donation confirmation push:", error);
  }
}
