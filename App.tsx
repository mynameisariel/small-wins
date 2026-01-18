import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Alert, View, Text, StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ThemeProvider, getStatusBarStyle } from './src/context/ThemeContext';
import { initDb } from './src/db/database';
import { LogBox } from 'react-native';

// Suppress Expo Go notification warning (we're using local notifications only)
LogBox.ignoreLogs(['expo-notifications: Android Push notifications']);

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const NOTIFICATION_SCHEDULED_KEY = 'notification_scheduled';
const NOTIFICATION_TIME_KEY = 'notification_time';

function AppContent() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    try {
      await initDb();
      await setupNotifications();
      setIsReady(true);
    } catch (error) {
      console.error('Initialization error:', error);
      Alert.alert('Error', 'Failed to initialize app');
    }
  };

  const setupNotifications = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
        return;
      }

      const isScheduled = await AsyncStorage.getItem(NOTIFICATION_SCHEDULED_KEY);
      if (isScheduled === 'true') {
        console.log('Notifications already scheduled');
        return;
      }

      // Get saved time or use default (9 PM)
      let hour = 21;
      let minute = 0;
      const savedTime = await AsyncStorage.getItem(NOTIFICATION_TIME_KEY);
      if (savedTime) {
        const parsed = JSON.parse(savedTime);
        hour = parsed.hour;
        minute = parsed.minute;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Small Wins 🌟',
          body: "What's one good thing that happened today?",
          data: { screen: 'Today' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
          channelId: 'default',
        },
      });

      await AsyncStorage.setItem(NOTIFICATION_SCHEDULED_KEY, 'true');
      console.log(`✅ Daily notification scheduled for ${hour}:${minute}`);
    } catch (error) {
      console.error('Notification setup error:', error);
    }
  };

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification tapped:', response);
      }
    );

    return () => subscription.remove();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style={getStatusBarStyle()} />
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontSize: 18,
    color: '#6B7280',
  },
});
