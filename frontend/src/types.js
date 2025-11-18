export const DEVICE_TYPES = {
  LIGHT: 'light',
  FAN: 'fan',
}

export const LIGHT_COLOR_TEMPERATURES = ['warm', 'neutral', 'cool', 'custom']

export const isLightDevice = (device) => device?.type === DEVICE_TYPES.LIGHT

export const isFanDevice = (device) => device?.type === DEVICE_TYPES.FAN

