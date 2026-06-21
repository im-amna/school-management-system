// src/lib/notifications.ts
// Helper function to create a notification for a user
// This gets called from attendance, results, and fees APIs

import { prisma } from "@/lib/prisma";
import { NotificationType } from "@/generated/prisma";

export async function createNotification(
  userId: string,
  message: string,
  type: NotificationType
) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        message,
        type,
      },
    });
  } catch (error) {
    // Notification failure should never break the main action (e.g. marking attendance)
    console.error("[createNotification]", error);
  }
}