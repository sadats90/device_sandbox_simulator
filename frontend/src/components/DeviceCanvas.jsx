import React from 'react'
import { isFanDevice, isLightDevice } from '../types'

export function DeviceCanvas({ device }) {
  if (!device) {
    return (
      <div className="canvas empty">
        <p>Select a device to begin testing.</p>
      </div>
    )
  }

  if (isLightDevice(device)) {
    const state = device.state ?? {}
    const power = state.power ?? false
    const brightness = typeof state.brightness === 'number' ? state.brightness : 0
    const colorTemperature = state.colorTemperature || 'warm'
    
    const glowIntensity = power ? Math.max(brightness, 15) : 0
    const glowOpacity = power ? Math.min((glowIntensity / 100) * 1.3, 1) : 0
    const bulbStyle = {
      '--glow-intensity': `${glowIntensity}`,
    }

    console.log('[DeviceCanvas] Rendering light:', {
      power,
      brightness,
      colorTemperature,
      glowIntensity,
      glowOpacity,
      deviceState: device.state,
      bulbStyle,
      cssVar: `--glow-intensity: ${glowIntensity}`,
    })

    return (
      <div className="canvas">
        <div 
          className={`light-bulb ${power ? 'on' : 'off'} ${colorTemperature || 'warm'}`} 
          style={bulbStyle}
        >
          <div 
            className="light-glow" 
            style={{ opacity: glowOpacity }}
          />
          <div className="light-core" />
        </div>
      </div>
    )
  }

  if (isFanDevice(device)) {
    const { power, speed = 0 } = device.state ?? {}
    const rotationDuration = `${Math.max(1800 - (speed ?? 0) * 16, 400)}ms`
    const fanStyle = {
      '--fan-speed': rotationDuration,
    }

    console.log('[DeviceCanvas] Rendering fan:', {
      power,
      speed,
      rotationDuration,
      deviceState: device.state,
      fanStyle,
      cssVar: `--fan-speed: ${rotationDuration}`,
    })

    return (
      <div className="canvas">
        <div className={`fan ${power ? 'active' : 'idle'}`} style={fanStyle}>
          <span className="fan-arm arm-horizontal" />
          <span className="fan-arm arm-vertical" />
        </div>
      </div>
    )
  }

  return (
    <div className="canvas empty">
      <p>Unsupported device type</p>
    </div>
  )
}

