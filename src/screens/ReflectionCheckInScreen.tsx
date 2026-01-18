import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getTodayLocalDate } from '../db/dateUtils';
import { upsertEntry } from '../db/database';
import { useTheme } from '../context/ThemeContext';

export const ReflectionCheckInScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();
  const [reflection, setReflection] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Get mood from navigation params
  const mood = (route.params as any)?.mood as number | undefined;

  const handleSave = async () => {
    if (!mood) {
      Alert.alert('Error', 'Mood not found. Please go back and select a mood.');
      return;
    }

    if (!reflection.trim()) {
      // Allow empty but suggest at least 1 character
      // For simplicity, we'll just allow empty and save anyway
    }

    setIsSaving(true);
    try {
      const todayDate = getTodayLocalDate();
      await upsertEntry(todayDate, mood, reflection.trim() || null);

      // Navigate to MainTabs with Stats tab
      // Use reset to clear the stack and navigate to MainTabs
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'MainTabs' as never,
            params: {
              screen: 'Stats' as never,
            } as never,
          },
        ],
      });
    } catch (error) {
      console.error('Error saving entry:', error);
      Alert.alert('Error', 'Failed to save your reflection. Please try again.');
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              Name one moment from today worth keeping.
            </Text>
          </View>

          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: colors.card,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="ie. i randomly saw an elementary school friend…"
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={6}
            value={reflection}
            onChangeText={setReflection}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[
              styles.saveButton,
              {
                backgroundColor: isSaving ? colors.border : colors.primary,
              },
            ]}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.7}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 36,
  },
  textInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 160,
    borderWidth: 1,
    marginBottom: 32,
    lineHeight: 24,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
