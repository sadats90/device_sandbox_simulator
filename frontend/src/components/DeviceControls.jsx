import { LIGHT_COLOR_TEMPERATURES, isFanDevice, isLightDevice } from '../types'

const LIGHT_COLORS = [
  { value: 'warm', label: 'Warm' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'cool', label: 'Cool' },
  { value: 'custom', label: 'Custom' },
].filter((option) => LIGHT_COLOR_TEMPERATURES.includes(option.value))

export function DeviceControls({ device, onStateChange, disabled }) {
  if (!device) {
    return (
      <div className="controls empty">
        <p>Select a device to configure controls.</p>
      </div>
    )
  }

  if (isLightDevice(device)) {
    const { power, brightness = 0, colorTemperature } = device.state ?? {}

    return (
      <div className="controls">
        <div className="control-row">
          <div>
            <p className="control-title">Power</p>
            <p className="control-muted">{power ? 'On' : 'Off'}</p>
          </div>
          <button
            type="button"
            className={`toggle ${power ? 'active' : ''}`}
            onClick={() => onStateChange({ power: !power })}
            disabled={disabled}
          >
            <span className="toggle-thumb" />
          </button>
        </div>

        <div className="control-row">
          <div>
            <p className="control-title">Color Temperature</p>
            <p className="control-muted">Choose a preset hue</p>
          </div>
          <div className="color-swatches">
            {LIGHT_COLORS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`color-swatch ${option.value} ${
                  colorTemperature === option.value ? 'selected' : ''
                }`}
                onClick={() => onStateChange({ colorTemperature: option.value })}
                disabled={disabled}
              >
                <span className="sr-only">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="control-row column">
          <div className="control-header">
            <p className="control-title">Brightness</p>
            <span className="control-value">{brightness}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={brightness ?? 0}
            onChange={(event) => {
              const newBrightness = Number(event.target.value)
              console.log('[DeviceControls] Slider onChange:', {
                eventValue: event.target.value,
                newBrightness,
                currentBrightness: brightness,
                deviceState: device.state,
              })
              onStateChange(
                { brightness: newBrightness },
                { debounce: true, silent: true },
              )
            }}
            disabled={disabled}
          />
        </div>
      </div>
    )
  }

  if (isFanDevice(device)) {
    const { power, speed = 0 } = device.state ?? {}

    return (
      <div className="controls">
        <div className="control-row">
          <div>
            <p className="control-title">Power</p>
            <p className="control-muted">{power ? 'On' : 'Off'}</p>
          </div>
          <button
            type="button"
            className={`toggle ${power ? 'active' : ''}`}
            onClick={() => onStateChange({ power: !power })}
            disabled={disabled}
          >
            <span className="toggle-thumb" />
          </button>
        </div>

        <div className="control-row column">
          <div className="control-header">
            <p className="control-title">Speed</p>
            <span className="control-value">{speed}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={speed ?? 0}
            onChange={(event) => {
              const newSpeed = Number(event.target.value)
              console.log('[DeviceControls] Fan speed onChange:', {
                eventValue: event.target.value,
                newSpeed,
                currentSpeed: speed,
                deviceState: device.state,
              })
              onStateChange({ speed: newSpeed }, { debounce: true, silent: true })
            }}
            disabled={disabled}
          />
        </div>
      </div>
    )
  }

  return null
}

