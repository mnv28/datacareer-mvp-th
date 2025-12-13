import FingerprintJS from '@fingerprintjs/fingerprintjs';

let fpPromise: Promise<FingerprintJS.Agent> | null = null;

/**
 * Initialize FingerprintJS and get device ID
 * Uses free version - no API key required
 */
export const getDeviceId = async (): Promise<string> => {
  try {
    // Initialize FingerprintJS only once
    if (!fpPromise) {
      fpPromise = FingerprintJS.load();
    }

    const fp = await fpPromise;
    const result = await fp.get();
    
    // Return the visitor ID as deviceId
    return result.visitorId;
  } catch (error) {
    console.error('Error getting device ID:', error);
    // Fallback: generate a random ID if FingerprintJS fails
    return `fallback-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
};
