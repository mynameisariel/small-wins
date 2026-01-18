import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface HeaderBarProps {
  leftAction?: {
    label: string;
    onPress: () => void;
  };
  centerText?: string;
  rightAction?: {
    label: string;
    onPress: () => void;
  };
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  leftAction,
  centerText,
  rightAction,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {leftAction ? (
          <TouchableOpacity onPress={leftAction.onPress} style={styles.actionButton}>
            <Text style={styles.actionText}>{leftAction.label}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.spacer} />
        )}
      </View>

      {centerText && (
        <View style={styles.center}>
          <Text style={styles.centerText}>{centerText}</Text>
        </View>
      )}

      <View style={styles.right}>
        {rightAction ? (
          <TouchableOpacity onPress={rightAction.onPress} style={styles.actionButton}>
            <Text style={styles.actionText}>{rightAction.label}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.spacer} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  left: {
    flex: 1,
    alignItems: 'flex-start',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  right: {
    flex: 1,
    alignItems: 'flex-end',
  },
  actionButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.tabActive,
  },
  centerText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  spacer: {
    width: 60, // Match button width for centering
  },
});
