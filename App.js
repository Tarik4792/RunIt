import { useEffect } from 'react';
import { registerForPushNotifications } from './lib/notifications';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';

export default function App() {
  useEffect(() => {
    registerForPushNotifications();

    const sub = Notifications.addNotificationResponseReceivedListener(response => {
      const gameId = response.notification.request.content.data?.gameId;
      if (gameId) router.push(`/game/${gameId}`);
    });

    return () => sub.remove();
  }, []);
}
