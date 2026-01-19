import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
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
import { PrimaryButton } from '../components/PrimaryButton';

export const ReflectionCheckInScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();
  const params = route.params as any;
  
  // Get params
  const mood = params?.mood as number | undefined;
  const editMode = params?.editMode as boolean | undefined;
  const existingHighlight = params?.highlight as string | undefined;
  const date = params?.date as string | undefined;
  
  const [reflection, setReflection] = useState(existingHighlight || '');
  const [isSaving, setIsSaving] = useState(false);

  // Initialize reflection from existing highlight if in edit mode
  useEffect(() => {
    if (existingHighlight) {
      setReflection(existingHighlight);
    }
  }, [existingHighlight]);

  const handleSave = async () => {
    if (!mood) {
      Alert.alert('Error', 'Mood not found. Please go back and select a mood.');
      return;
    }

    setIsSaving(true);
    try {
      const entryDate = date || getTodayLocalDate();
      await upsertEntry(entryDate, mood, reflection.trim() || null);

      // Navigate based on mode
      if (editMode) {
        // Edit mode: go back to Today screen (pop current screen)
        navigation.goBack();
      } else {
        // First-time daily flow: Navigate to MainTabs with Stats tab
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
      }
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
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              Name one moment from today worth keeping.
            </Text>
          </View>

          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: colors.cardBase,
                color: colors.textPrimary,
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

          <PrimaryButton
            title={isSaving ? 'Saving...' : 'Save'}
            onPress={handleSave}
            disabled={isSaving}
            variant="save"
          />
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
});
