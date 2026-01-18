import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  ImageBackground,
} from 'react-native';
import { colors } from '../theme/colors';

interface BlobCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'reflection' | 'note' | 'mood';
  style?: ViewStyle;
  disabled?: boolean;
}

// Placeholder blob shape - will be replaced with PNG assets later
const getBlobStyle = (variant: string) => {
  // Simulate blob with highly rounded, irregular container
  // Later: replace with ImageBackground using PNG asset
  const baseStyle: ViewStyle = {
    backgroundColor: colors.cardBase,
    borderRadius: 40,
    // Simulate irregular shape with varying border radius
    borderTopLeftRadius: 35,
    borderTopRightRadius: 45,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 30,
    padding: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  };

  switch (variant) {
    case 'reflection':
      return {
        ...baseStyle,
        minHeight: 120,
        padding: 24,
      };
    case 'note':
      return {
        ...baseStyle,
        minHeight: 150,
        padding: 20,
      };
    case 'mood':
      return {
        ...baseStyle,
        width: 80,
        height: 80,
        padding: 12,
        borderRadius: 40,
        borderTopLeftRadius: 35,
        borderTopRightRadius: 45,
        borderBottomLeftRadius: 50,
        borderBottomRightRadius: 30,
      };
    default:
      return baseStyle;
  }
};

export const BlobCard: React.FC<BlobCardProps> = ({
  children,
  onPress,
  variant = 'default',
  style,
  disabled = false,
}) => {
  const blobStyle = getBlobStyle(variant);

  if (onPress) {
    return (
      <TouchableOpacity
        style={[blobStyle, style]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[blobStyle, style]}>{children}</View>;
};
