import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const NOTIFICATIONS_FILE = path.join(__dirname, 'data', 'notifications.json');

// Ensure notifications storage file exists
function getNotifications() {
  try {
    if (!fs.existsSync(NOTIFICATIONS_FILE)) {
      fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify([], null, 2));
    }
    const data = fs.readFileSync(NOTIFICATIONS_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading notifications:', err);
    return [];
  }
}

function saveNotifications(notifications) {
  try {
    fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(notifications, null, 2));
  } catch (err) {
    console.error('Error saving notifications:', err);
  }
}

/**
 * Dispatch automated WhatsApp / SMS & App notifications
 */
export function dispatchNotification({
  channel = 'whatsapp',
  type = 'ORDER_UPDATE',
  recipientName = 'Customer',
  phone = '+91 88856 00899',
  title,
  message,
  orderId = null,
  metadata = {}
}) {
  const notifications = getNotifications();
  const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateNow = new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short' });

  const newNotice = {
    id: 'NOTIF-' + Date.now().toString().slice(-6) + Math.floor(100 + Math.random() * 900),
    type,
    channel,
    recipientName,
    phone,
    title,
    message,
    orderId,
    timestamp: `${dateNow}, ${timeNow}`,
    isoDate: new Date().toISOString(),
    isRead: false,
    status: 'DELIVERED',
    metadata
  };

  // Add to top of notification history
  notifications.unshift(newNotice);
  // Keep last 100 notifications
  if (notifications.length > 100) notifications.length = 100;
  saveNotifications(notifications);

  console.log(`[${channel.toUpperCase()} DISPATCH] To: ${phone} | ${title}: ${message}`);
  return newNotice;
}

export function getAllNotifications(limit = 30) {
  return getNotifications().slice(0, limit);
}

export function markAsRead(notificationId) {
  const notifications = getNotifications();
  const notice = notifications.find(n => n.id === notificationId);
  if (notice) {
    notice.isRead = true;
    saveNotifications(notifications);
  }
  return notice;
}
