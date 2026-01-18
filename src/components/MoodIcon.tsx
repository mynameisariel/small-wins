import React from 'react';
import { View, Image, StyleSheet, ImageSourcePropType } from 'react-native';
import { getMoodById } from '../constants/moods';
import { BlobCard } from './BlobCard';
import { colors } from '../theme/colors';

interface MoodIconProps {
  moodValue: number;
  size?: 'small' | 'medium' | 'large';
  showBlob?: boolean;
}

// Placeholder mood icon mapping - will be replaced with PNG assets
const getMoodIconSource = (moodValue: number): ImageSourcePropType | null => {
  // For now, return null to use placeholder
  // Later: return require(`../assets/moods/${getMoodKey(moodValue)}.png`)
  return null;
};

const getMoodKey = (moodValue: number): string => {
  const mood = getMoodById(moodValue);
  return mood.label.toLowerCase();
};

const getSize = (size: string) => {
  switch (size) {
    case 'small':
      return { width: 40, height: 40, iconSize: 24 };
    case 'large':
      return { width: 100, height: 100, iconSize: 60 };
    default: // medium
      return { width: 60, height: 60, iconSize: 36 };
  }
};

export const MoodIcon: React.FC<MoodIconProps> = ({
  moodValue,
  size = 'medium',
  showBlob = true,
}) => {
  const mood = getMoodById(moodValue);
  const { width, height, iconSize } = getSize(size);
  const iconSource = getMoodIconSource(moodValue);

  // For now, use emoji as placeholder. Later replace with Image if iconSource exists
  if (showBlob) {
    return (
      <BlobCard variant="mood" style={{ width, height }}>
        <View style={styles.iconContainer}>
          {iconSource ? (
            <Image
              source={iconSource}
              style={{ width: iconSize, height: iconSize }}
              resizeMode="contain"
            />
          ) : (
            <View style={[styles.placeholderIcon, { width: iconSize, height: iconSize }]}>
              {/* Placeholder: simple circle with emoji */}
              <View
                style={[
                  styles.emojiContainer,
                  { width: iconSize, height: iconSize, borderRadius: iconSize / 2 },
                ]}
              >
                {/* Emoji as placeholder - will be replaced with PNG */}
                {/* In actual implementation, render emoji text or placeholder graphic */}
              </View>
            </View>
          )}
        </View>
      </BlobCard>
    );
  }

  // Without blob wrapper, just show icon
  return (
    <View style={[{ width, height }, styles.iconContainer]}>
      {iconSource ? (
        <Image
          source={iconSource}
          style={{ width: iconSize, height: iconSize }}
          resizeMode="contain"
        />
      ) : (
        <View style={[styles.placeholderIcon, { width: iconSize, height: iconSize }]}>
          {/* Placeholder emoji */}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 999,
  },
  emojiContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
