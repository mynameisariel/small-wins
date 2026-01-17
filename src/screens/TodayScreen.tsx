import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard, // <-- ADD THIS IMPORT
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getTodayLocalDate, formatDisplayDate } from '../db/dateUtils';
import { getEntryByDate, upsertEntry, Entry } from '../db/database';
import { MoodSelector } from '../components/MoodSelector';

export const TodayScreen: React.FC = () => {
  const [todayDate] = useState(getTodayLocalDate());
  const [mood, setMood] = useState<number | null>(null);
  const [highlight, setHighlight] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    loadTodayEntry();
  }, []);

  const loadTodayEntry = async () => {
    const entry = await getEntryByDate(todayDate);
    if (entry) {
      setMood(entry.mood);
      setHighlight(entry.highlight || '');
    }
  };

  const handleSave = async () => {
    if (!mood && !highlight.trim()) {
      Alert.alert('Nothing to save', 'Add a mood or highlight first!');
      return;
    }

    // Dismiss keyboard immediately
    Keyboard.dismiss(); // <-- ADD THIS LINE

    setIsSaving(true);
    try {
      await upsertEntry(todayDate, mood, highlight.trim() || null);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    } catch (error) {
      Alert.alert('Error', 'Failed to save entry');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Today</Text>
            <Text style={styles.date}>{formatDisplayDate(todayDate)}</Text>
          </View>

          <MoodSelector selectedMood={mood} onSelectMood={setMood} />

          <View style={styles.highlightSection}>
            <Text style={styles.label}>What's one small win today? 🌟</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Even tiny victories count..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              value={highlight}
              onChangeText={setHighlight}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <Text style={styles.saveButtonText}>
              {showSaved ? 'Saved ✅' : isSaving ? 'Saving...' : 'Save Entry'}
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
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    color: '#6B7280',
  },
  highlightSection: {
    marginTop: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});