import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabsNavigator } from './TabNavigator';
import { MoodCheckInScreen } from '../screens/MoodCheckInScreen';
import { ReflectionCheckInScreen } from '../screens/ReflectionCheckInScreen';
import { getTodayLocalDate } from '../db/dateUtils';
import { getEntryByDate } from '../db/database';

const Stack = createNativeStackNavigator();

export const RootNavigator: React.FC = () => {
  const [hasTodayEntry, setHasTodayEntry] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkTodayEntry();
  }, []);

  const checkTodayEntry = async () => {
    try {
      const todayDate = getTodayLocalDate();
      const entry = await getEntryByDate(todayDate);
      setHasTodayEntry(!!entry);
    } catch (error) {
      console.error('Error checking today entry:', error);
      // On error, default to showing tabs (safer fallback)
      setHasTodayEntry(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking
  if (isLoading || hasTodayEntry === null) {
    return null; // App.tsx will show loading
  }

  // If today's entry exists, show MainTabs
  // Otherwise, show DailyCheckIn flow
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={hasTodayEntry ? 'MainTabs' : 'MoodCheckIn'}
    >
      <Stack.Screen name="MoodCheckIn" component={MoodCheckInScreen} />
      <Stack.Screen name="ReflectionCheckIn" component={ReflectionCheckInScreen} />
      <Stack.Screen name="MainTabs" component={MainTabsNavigator} />
    </Stack.Navigator>
  );
};
