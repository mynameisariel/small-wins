import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { getMoodById, getMoodImage } from '../constants/moods';
import { BlobCard } from './BlobCard';
import { colors } from '../theme/colors';

interface MoodIconProps {
  moodValue: number;
  size?: 'small' | 'medium' | 'large';
  showBlob?: boolean;
  selected?: boolean;
}

const getSize = (size: string) => {
  switch (size) {
    case 'small':
      return { width: 40, height: 40, iconSize: 24 };
    case 'large':
      return { width: 180, height: 180, iconSize: 120 };
    default: // medium
      return { width: 60, height: 60, iconSize: 36 };
  }
};

export const MoodIcon: React.FC<MoodIconProps> = ({
  moodValue,
  size = 'medium',
  showBlob = true,
  selected = false,
}) => {
  const mood = getMoodById(moodValue);
  const { width, height, iconSize } = getSize(size);
  const moodKey = mood.key || mood.label.toLowerCase();
  const iconSource = getMoodImage(moodKey);

  if (!iconSource) {
    console.warn(`Mood image not found for key: ${moodKey}`);
  }

  const iconElement = iconSource ? (
    <Image
      source={iconSource}
      style={{ width: iconSize, height: iconSize }}
      resizeMode="contain"
    />
  ) : null;

  if (showBlob) {
    return (
      <BlobCard variant="mood" style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
        <View style={[styles.iconContainer, { width: '100%', height: '100%' }]}>
          {iconElement}
        </View>
      </BlobCard>
    );
  }

  // Without blob wrapper, just show icon
  return (
    <View style={[{ width, height }, styles.iconContainer]}>
      {iconElement}
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
