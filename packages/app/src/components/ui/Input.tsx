import React from 'react';
import {
  TextInput,
  type TextInputProps,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/layout';
import { fontSizes, fonts } from '@/theme/typography';

interface InputProps extends TextInputProps {
  style?: ViewStyle & TextStyle;
}

export const Input = React.forwardRef<TextInput, InputProps>(
  ({ style, editable, ...props }, ref) => {
    return (
      <TextInput
        ref={ref}
        editable={editable}
        placeholderTextColor={colors['muted-foreground']}
        style={[
          {
            height: 44,
            borderRadius: radii.md,
            borderWidth: 1,
            borderColor: colors.input,
            backgroundColor: 'transparent',
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            fontSize: fontSizes.base,
            fontFamily: fonts.regular,
            color: colors.foreground,
          },
          editable === false && { opacity: 0.5 },
          style,
        ]}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
