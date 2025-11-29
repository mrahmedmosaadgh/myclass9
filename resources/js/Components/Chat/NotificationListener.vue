<template>
    <!-- This component doesn't render anything, it just listens for notifications -->
    <div style="display: none;"></div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import { usePage } from '@inertiajs/vue3';
import { useChatNotifications } from '@/Services/ChatNotificationService';

const props = defineProps({
    userId: {
        type: Number,
        required: true
    }
});

const { initNotifications, sendNotification } = useChatNotifications();
const { auth } = usePage().props;

// Initialize Firebase notifications
onMounted(() => {
    try {
        // Initialize notifications
        initNotifications(props.userId);

        // Set up Laravel Echo listeners for new messages
        if (window.Echo) {
            // Listen for private messages
            window.Echo.private(`user.${props.userId}`)
                .listen('.message.sent', (e) => {
                    // Send a Firebase notification
                    sendNotification(props.userId, {
                        title: `New message from ${e.user_name}`,
                        message: e.body,
                        conversationId: e.conversation_id,
                        senderId: e.user_id,
                        type: 'message'
                    });
                });
        } else {
            console.warn('Laravel Echo not initialized. Real-time notifications will not work.');
        }
    } catch (error) {
        console.error('Error setting up notification listeners:', error);
    }
});

onUnmounted(() => {
    try {
        // Clean up Echo listeners
        if (window.Echo) {
            window.Echo.leave(`user.${props.userId}`);
        }
    } catch (error) {
        console.error('Error cleaning up notification listeners:', error);
    }
});
</script>
