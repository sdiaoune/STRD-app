import type { NavigationProp } from '@react-navigation/native';
import { useStore } from '../state/store';

export function openUserProfile(navigation: NavigationProp<any>, targetUserId?: string | null) {
  if (!targetUserId) return;
  const currentUserId = useStore.getState().currentUser.id;
  if (targetUserId === currentUserId) {
    navigation.navigate('Profile' as never);
  } else {
    navigation.navigate('Profile' as never, {
      screen: 'RunnerProfile',
      params: { userId: targetUserId },
    } as never);
  }
}



