type CameraDevice = {
  deviceId: string;
  label?: string;
};

const VIRTUAL_CAMERA_KEYWORDS = [
  "virtual",
  "obs",
  "droidcam",
  "iriun",
  "snap camera",
  "capture",
  "screen",
  "ndi",
];

export function pickPreferredCameraDeviceId(devices: CameraDevice[]) {
  if (devices.length === 0) {
    return null;
  }

  const physicalCamera = devices.find((device) => {
    const label = device.label?.toLowerCase() ?? "";
    return !VIRTUAL_CAMERA_KEYWORDS.some((keyword) => label.includes(keyword));
  });

  return physicalCamera?.deviceId ?? devices[0]?.deviceId ?? null;
}
