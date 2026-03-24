/**
 * Generate and persist a unique device fingerprint.
 * Uses localStorage + a random UUID as a simple device identifier.
 */
const DEVICE_ID_KEY = "astrochat_device_id";

export function getDeviceId(): string {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}
