import React, { useState } from 'react';
import { TextInput, type TextInputProps } from 'react-native';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/layout';
import { fontSizes, fonts } from '@/theme/typography';

// Lab form input: black field, faint border, red border while focused.
// React 19: ref is a regular prop, no forwardRef needed.
type InputProps = TextInputProps & { ref?: React.Ref<React.ComponentRef<typeof TextInput>> };

export function Input({ ref, style, editable, onFocus, onBlur, ...props }: InputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      ref={ref}
      editable={editable}
      placeholderTextColor={colors['muted-foreground']}
      selectionColor={colors.brand.red}
      onFocus={(e) => { setFocused(true); onFocus?.(e); }}
      onBlur={(e) => { setFocused(false); onBlur?.(e); }}
      style={[
        {
          height: 48,
          borderRadius: radii.lg,
          borderWidth: 1,
          borderColor: focused ? colors.brand.red : colors.border,
          backgroundColor: '#000',
          paddingHorizontal: spacing.md,
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
