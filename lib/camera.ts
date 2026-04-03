export function pickPreferredCameraDevice(devices: MediaDeviceInfo[]) {
    const normalizedDevices = devices.filter((device) => device.deviceId);

    if (normalizedDevices.length === 0) {
        return undefined;
    }

    const rearCamera = normalizedDevices.find((device) =>
        /back|rear|environment/i.test(device.label)
    );

    if (rearCamera) {
        return rearCamera;
    }

    const physicalCamera = normalizedDevices.find(
        (device) =>
            !/virtual|obs|snap|manycam|stream|capture|screen|ndi|droidcam/i.test(device.label)
    );

    if (physicalCamera) {
        return physicalCamera;
    }

    return normalizedDevices[0];
}
