export function DeviceSidebar({
  devices,
  selectedDeviceId,
  onSelectDevice,
  presets,
  onApplyPreset,
  onDeletePreset,
}) {
  return (
    <aside className="sidebar">
      <div>
        <p className="sidebar-heading">Devices</p>
        <div className="sidebar-section">
          {devices.map((device) => (
            <button
              key={device.id}
              className={`sidebar-chip ${device.id === selectedDeviceId ? 'active' : ''}`}
              onClick={() => onSelectDevice(device.id)}
              type="button"
            >
              {device.name}
            </button>
          ))}
        </div>
      </div>

      <div className="sidebar-presets">
        <p className="sidebar-heading">Saved Presets</p>
        {presets.length === 0 ? (
          <p className="sidebar-empty">Nothing added yet</p>
        ) : (
          <ul className="preset-list">
            {presets.map((preset) => (
              <li key={preset.id} className="preset-item">
                <button
                  type="button"
                  className="preset-apply"
                  onClick={() => onApplyPreset(preset)}
                >
                  {preset.name}
                </button>
                <button
                  type="button"
                  className="preset-remove"
                  onClick={() => onDeletePreset(preset)}
                  aria-label={`Delete preset ${preset.name}`}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  )
}

