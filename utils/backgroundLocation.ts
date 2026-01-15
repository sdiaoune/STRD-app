import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';

export const BACKGROUND_LOCATION_TASK = 'background-location-task';

// Store callback reference for location updates
let locationUpdateCallback: ((lat: number, lon: number, timestamp: number, accuracy?: number, speed?: number | null) => void) | null = null;

// Define the background task
TaskManager.defineTask(BACKGROUND_LOCATION_TASK, ({ data, error }) => {
  if (error) {
    console.error('[BackgroundLocation] Task error:', error);
    return;
  }
  
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    if (locations && locations.length > 0) {
      const location = locations[locations.length - 1]; // Use most recent location
      const { latitude, longitude, speed, accuracy } = location.coords;
      const timestamp = location.timestamp;
      
      console.log('[BackgroundLocation] Received location:', { latitude, longitude, accuracy, speed });
      
      // Call the callback if registered
      if (locationUpdateCallback) {
        locationUpdateCallback(latitude, longitude, timestamp, accuracy ?? undefined, speed ?? null);
      }
    }
  }
});

/**
 * Request background location permissions
 */
export async function requestBackgroundLocationPermission(): Promise<boolean> {
  try {
    // First check/request foreground permission
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus !== 'granted') {
      console.log('[BackgroundLocation] Foreground permission denied');
      return false;
    }
    
    // Then request background permission
    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus !== 'granted') {
      console.log('[BackgroundLocation] Background permission denied');
      // On Android 10+, we might still be able to use foreground location
      // Return true if at least foreground is granted
      return Platform.OS === 'android';
    }
    
    console.log('[BackgroundLocation] All permissions granted');
    return true;
  } catch (error) {
    console.error('[BackgroundLocation] Error requesting permissions:', error);
    return false;
  }
}

/**
 * Check if background location is available
 */
export async function hasBackgroundLocationPermission(): Promise<boolean> {
  try {
    const { status: foreground } = await Location.getForegroundPermissionsAsync();
    const { status: background } = await Location.getBackgroundPermissionsAsync();
    return foreground === 'granted' && background === 'granted';
  } catch {
    return false;
  }
}

/**
 * Start background location tracking
 */
export async function startBackgroundLocationTracking(
  onLocationUpdate: (lat: number, lon: number, timestamp: number, accuracy?: number, speed?: number | null) => void
): Promise<boolean> {
  try {
    // Store the callback
    locationUpdateCallback = onLocationUpdate;
    
    // Check if task is already running
    const isRunning = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    if (isRunning) {
      console.log('[BackgroundLocation] Task already running');
      return true;
    }
    
    // Start background location updates
    await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
      accuracy: Location.Accuracy.BestForNavigation,
      timeInterval: 1000, // Update every 1 second
      distanceInterval: 1, // Update every 1 meter
      showsBackgroundLocationIndicator: true, // iOS: show blue bar indicator
      foregroundService: {
        notificationTitle: 'STRD is tracking your run',
        notificationBody: 'Distance and pace are being recorded',
        notificationColor: '#00C853',
      },
      pausesUpdatesAutomatically: false,
      activityType: Location.ActivityType.Fitness,
      deferredUpdatesInterval: 0,
      deferredUpdatesDistance: 0,
    });
    
    console.log('[BackgroundLocation] Started background location tracking');
    return true;
  } catch (error) {
    console.error('[BackgroundLocation] Error starting background tracking:', error);
    return false;
  }
}

/**
 * Stop background location tracking
 */
export async function stopBackgroundLocationTracking(): Promise<void> {
  try {
    locationUpdateCallback = null;
    
    const isRunning = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    if (isRunning) {
      await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
      console.log('[BackgroundLocation] Stopped background location tracking');
    }
  } catch (error) {
    console.error('[BackgroundLocation] Error stopping background tracking:', error);
  }
}

/**
 * Get current location once
 */
export async function getCurrentLocation(): Promise<Location.LocationObject | null> {
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.BestForNavigation,
    });
    return location;
  } catch (error) {
    console.error('[BackgroundLocation] Error getting current location:', error);
    return null;
  }
}
