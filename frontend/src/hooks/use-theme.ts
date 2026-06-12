/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useTheme() {
  const scheme = useColorScheme();
  // coerce scheme to either 'light' or 'dark' to satisfy Colors index signature
  const theme: 'light' | 'dark' = scheme === 'dark' ? 'dark' : 'light';

  return Colors[theme];
}
