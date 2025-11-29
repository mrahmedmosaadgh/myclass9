import { database } from '@/firebase/init';
import { ref as dbRef, onValue, off, serverTimestamp, push, update } from 'firebase/database';

class NotificationService {
    constructor() {
        this.listeners = new Map();
    }

    // Subscribe to notifications
    subscribeToNotifications(userId, callback) {
        const userNotificationsRef = dbRef(database, `users/${userId}/notifications`);

        onValue(userNotificationsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const notifications = Object.entries(data)
                    .map(([id, notification]) => ({
                        id,
                        ...notification,
                    }));
                callback({ data: notifications });
            } else {
                callback({ data: [] });
            }
        });

        this.listeners.set(`notifications_${userId}`, userNotificationsRef);
    }

    // Mark notification as read
    async markNotificationAsRead(userId, notificationId) {
        const notificationRef = dbRef(database, `users/${userId}/notifications/${notificationId}`);
        await update(notificationRef, {
            read: true
        });
    }

    // Unsubscribe from all listeners
    unsubscribeAll() {
        this.listeners.forEach((ref) => {
            off(ref);
        });
        this.listeners.clear();
    }
}

export default new NotificationService();

