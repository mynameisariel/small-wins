import React from 'react';
import { Text, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TodayScreen } from '../screens/TodayScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { WinsListScreen } from '../screens/WinsListScreen';
import { PastWinsScreen } from '../screens/PastWinsScreen';
import { MoodCheckInScreen } from '../screens/MoodCheckInScreen';
import { ReflectionCheckInScreen } from '../screens/ReflectionCheckInScreen';
import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Today Stack Navigator (for edit flow with tabs visible)
const TodayStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TodayMain" component={TodayScreen} />
      <Stack.Screen name="MoodCheckInEdit" component={MoodCheckInScreen} />
      <Stack.Screen name="ReflectionCheckInEdit" component={ReflectionCheckInScreen} />
    </Stack.Navigator>
  );
};

// Stats Stack Navigator (for nested navigation)
const StatsStack = () => {
  const { colors } = useTheme();
  
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="StatsMain"
        component={StatsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PastWins"
        component={PastWinsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="WinsList"
        component={WinsListScreen}
        options={{
          headerTitle: 'All Wins',
          headerBackTitle: 'Back',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.tabActive,
        }}
      />
    </Stack.Navigator>
  );
};

export const MainTabsNavigator: React.FC = () => {
  const { colors } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          height: Platform.OS === 'ios' ? 88 : 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: Platform.OS === 'ios' ? 0 : 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Today"
        component={TodayStack}
        options={{
          tabBarLabel: 'Today',
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsStack}
        options={{
          tabBarLabel: 'Stats',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
};
