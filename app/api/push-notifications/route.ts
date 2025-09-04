import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore
import webpush from 'web-push';

// Configure VAPID keys with validation
const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY
};

// Validate VAPID keys are present
if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
  console.warn('VAPID keys not configured. Push notifications will not work.');
} else {
  // Set VAPID details only if keys are available
  webpush.setVapidDetails(
    'mailto:your-email@example.com', // Replace with your email
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );
}

// In-memory storage for subscriptions (in production, use a database)
let subscriptions: any[] = [];

// Subscribe to push notifications
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, subscription, payload } = body;

    if (action === 'subscribe') {
      // Store the subscription
      const existingIndex = subscriptions.findIndex(
        sub => sub.endpoint === subscription.endpoint
      );
      
      if (existingIndex >= 0) {
        subscriptions[existingIndex] = subscription;
      } else {
        subscriptions.push(subscription);
      }
      
      console.log('Push subscription stored:', subscription.endpoint);
      return NextResponse.json({ success: true, message: 'Subscription stored successfully' });
    }

    if (action === 'unsubscribe') {
      // Remove the subscription
      subscriptions = subscriptions.filter(
        sub => sub.endpoint !== subscription.endpoint
      );
      
      console.log('Push subscription removed:', subscription.endpoint);
      return NextResponse.json({ success: true, message: 'Subscription removed successfully' });
    }

    if (action === 'send') {
      // Check if VAPID keys are configured
      if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
        return NextResponse.json({ error: 'Push notifications not configured - VAPID keys missing' }, { status: 500 });
      }

      // Send push notification to all subscriptions
      if (!payload) {
        return NextResponse.json({ error: 'Payload is required for sending notifications' }, { status: 400 });
      }

      const notificationPayload = JSON.stringify(payload);
      const sendPromises = subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(subscription, notificationPayload);
          console.log('Push notification sent to:', subscription.endpoint);
        } catch (error) {
          console.error('Error sending push notification:', error);
          // Remove invalid subscriptions
          if (error instanceof Error && error.message.includes('410')) {
            subscriptions = subscriptions.filter(sub => sub.endpoint !== subscription.endpoint);
          }
        }
      });

      await Promise.all(sendPromises);
      return NextResponse.json({ 
        success: true, 
        message: `Notifications sent to ${subscriptions.length} subscribers` 
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Push notification API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get subscription status
export async function GET() {
  try {
    return NextResponse.json({ 
      subscriptionCount: subscriptions.length,
      vapidConfigured: !!(vapidKeys.publicKey && vapidKeys.privateKey)
    });
  } catch (error) {
    console.error('Error getting push notification status:', error);
    return NextResponse.json({ error: 'Failed to get status' }, { status: 500 });
  }
}