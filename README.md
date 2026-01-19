# Small Wins 🌟

A daily reflection app built with React Native + Expo that helps you track small positive moments and moods.

> "Your identity is shaped not only by big moments, but by small daily wins."

## Features

- **Daily Check-In** - Log your mood + one meaningful moment each day
- **Mood Tracking** - 12 moods with visual calendar heat map
- **Streak System** - Track current & longest streaks
- **Past Wins** - Interactive deck view to revisit memories
- **Daily Reminders** - Customizable notification time
- **Local Storage** - All data stays on your device (SQLite)

## Tech Stack

- **React Native** + **Expo** (~SDK 51)
- **TypeScript**
- **React Navigation** (Bottom Tabs + Native Stack)
- **expo-sqlite** - Local database
- **expo-notifications** - Daily reminders
- **react-native-calendars** - Mood visualization

## How It Works

### First-Time Daily Flow
1. User opens app (no entry for today)
2. **MoodCheckInScreen** - Select mood (12 options)
3. **ReflectionCheckInScreen** - Write one moment worth keeping
4. Entry saved → Redirected to **Stats** tab

### Returning User Flow
1. User opens app (entry exists for today)
2. Lands on **Today** tab showing read-only summary
3. Tap reflection card or mood icon to edit
4. After editing → Returns to Today (tabs stay visible)

## Notifications

- Default: 9:00 PM daily
- Customizable via Settings → TimePicker
- Scheduled with `expo-notifications` (local only)

---

Built with ❤️ for tracking life's small wins.