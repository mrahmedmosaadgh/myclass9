import { database } from './init';
import { ref as dbRef, set, onValue, off, serverTimestamp, get } from 'firebase/database';

/**
 * Service for handling private chat notifications using Firebase
 */
class PrivateChatNotificationService {
    /**
     * Initialize the service
     */
    constructor() {
        this.listeners = new Map();
    }

    /**
     * Send a notification when a new message is sent
     * 
     * @param {Object} message - The message object
     * @param {number} conversationId - The conversation ID
     * @param {number} senderId - The sender's user ID
     * @param {number} recipientId - The recipient's user ID
     */
    async sendMessageNotification(message, conversationId, senderId, recipientId) {
        try {
            // Create a reference to the recipient's notifications
            const notificationRef = dbRef(
                database, 
                `private_chat_notifications/${recipientId}/${conversationId}`
            );
            
            // Create a new notification
            await set(notificationRef, {
                message_id: message.id,
                sender_id: senderId,
                conversation_id: conversationId,
                message_preview: message.body.substring(0, 50),
                timestamp: serverTimestamp(),
                is_read: false
            });
            
            console.log('Message notification sent successfully');
        } catch (error) {
            console.log('Error sending message notification:', error);
        }
    }

    /**
     * Listen for new message notifications for a specific user
     * 
     * @param {number} userId - The user ID to listen for notifications
     * @param {Function} callback - The callback function to call when a new notification is received
     */
    listenForNotifications(userId, callback) {
        if (!userId) {
            console.log('User ID is required to listen for notifications');
            return;
        }
        
        // Create a reference to the user's notifications
        const notificationsRef = dbRef(database, `private_chat_notifications/${userId}`);
        
        // Remove any existing listener for this user
        this.removeNotificationListener(userId);
        
        // Listen for changes to the user's notifications
        const listener = onValue(notificationsRef, (snapshot) => {
            const notifications = snapshot.val() || {};
            callback(notifications);
        }, (error) => {
            console.log('Error listening for notifications:', error);
        });
        
        // Store the listener reference so we can remove it later
        this.listeners.set(userId, { ref: notificationsRef, listener });
        
        console.log(`Listening for notifications for user ${userId}`);
    }

    /**
     * Remove a notification listener for a specific user
     * 
     * @param {number} userId - The user ID to stop listening for notifications
     */
    removeNotificationListener(userId) {
        const listenerInfo = this.listeners.get(userId);
        
        if (listenerInfo) {
            off(listenerInfo.ref, listenerInfo.listener);
            this.listeners.delete(userId);
            console.log(`Stopped listening for notifications for user ${userId}`);
        }
    }

    /**
     * Mark a notification as read
     * 
     * @param {number} userId - The user ID
     * @param {number} conversationId - The conversation ID
     */
    async markNotificationAsRead(userId, conversationId) {
        try {
            const notificationRef = dbRef(
                database, 
                `private_chat_notifications/${userId}/${conversationId}`
            );
            
            // Get the current notification
            const snapshot = await get(notificationRef);
            
            if (snapshot.exists()) {
                const notification = snapshot.val();
                
                // Update the notification to mark it as read
                await set(notificationRef, {
                    ...notification,
                    is_read: true
                });
                
                console.log('Notification marked as read');
            }
        } catch (error) {
            console.log('Error marking notification as read:', error);
        }
    }

    /**
     * Get the count of unread notifications for a user
     * 
     * @param {number} userId - The user ID
     * @returns {Promise<number>} - The count of unread notifications
     */
    async getUnreadNotificationsCount(userId) {
        try {
            const notificationsRef = dbRef(database, `private_chat_notifications/${userId}`);
            const snapshot = await get(notificationsRef);
            
            if (!snapshot.exists()) {
                return 0;
            }
            
            const notifications = snapshot.val();
            let count = 0;
            
            // Count unread notifications
            Object.values(notifications).forEach(notification => {
                if (!notification.is_read) {
                    count++;
                }
            });
            
            return count;
        } catch (error) {
            console.log('Error getting unread notifications count:', error);
            return 0;
        }
    }
}

// Create and export a singleton instance
const privateChatNotifications = new PrivateChatNotificationService();
export default privateChatNotifications;
