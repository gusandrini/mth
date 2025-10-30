// src/notifications.ts
import * as Notifications from 'expo-notifications';

export async function scheduleLoginNotification() {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    const req = await Notifications.requestPermissionsAsync();
    if (req.status !== 'granted') return;
  }

  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
        
      title: 'Bem-vindo! 👋',
      body: 'Login realizado com sucesso.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 10,
      // repeats: false, // (opcional) false por padrão
    },
  });
}
