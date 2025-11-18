import { useEffect, useMemo, useRef, useState } from 'react'
import { api } from './api/client'
import { isLightDevice } from './types'
import { DeviceSidebar } from './components/DeviceSidebar'
import { DeviceCanvas } from './components/DeviceCanvas'
import { DeviceControls } from './components/DeviceControls'
import './styles/App.css'

function App() {
  const [devices, setDevices] = useState([])
  const [selectedDeviceId, setSelectedDeviceId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const pendingUpdateRef = useRef(null)
  const pendingTimeoutRef = useRef(null)

  useEffect(() => {
    loadDevices()
  }, [])

  const loadDevices = async (showSpinner = true) => {
    if (showSpinner) {
      setLoading(true)
    } else {
      setBusy(true)
    }

    try {
      const data = await api.getDevices()
      setDevices(data)
      if (!selectedDeviceId && data.length > 0) {
        setSelectedDeviceId(data[0].id)
      }
      setError(null)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Failed to load devices.')
    } finally {
      if (showSpinner) {
        setLoading(false)
      } else {
        setBusy(false)
      }
    }
  }

  const selectedDevice = useMemo(
    () => devices.find((device) => device.id === selectedDeviceId) ?? null,
    [devices, selectedDeviceId],
  )

  useEffect(() => {
    if (!message) return
    const timer = window.setTimeout(() => setMessage(null), 3200)
    return () => window.clearTimeout(timer)
  }, [message])

  useEffect(() => {
    if (!error) return
    const timer = window.setTimeout(() => setError(null), 5000)
    return () => window.clearTimeout(timer)
  }, [error])

  useEffect(
    () => () => {
      if (pendingTimeoutRef.current) {
        window.clearTimeout(pendingTimeoutRef.current)
      }
    },
    [],
  )

  const replaceDevice = (updatedDevice) => {
    console.log('[App] replaceDevice called:', {
      deviceId: updatedDevice.id,
      brightness: updatedDevice.state?.brightness,
      fullState: updatedDevice.state,
    })
    setDevices((prev) => {
      const oldDevice = prev.find((d) => d.id === updatedDevice.id)
      const updated = prev.map((device) => (device.id === updatedDevice.id ? updatedDevice : device))
      console.log('[App] replaceDevice - state update:', {
        oldBrightness: oldDevice?.state?.brightness,
        newBrightness: updatedDevice.state?.brightness,
      })
      return updated
    })
  }

  const applyOptimisticUpdate = (update) => {
    if (!selectedDeviceId) return

    console.log('[App] applyOptimisticUpdate:', {
      selectedDeviceId,
      update,
      updateBrightness: update.brightness,
    })

    setDevices((prev) => {
      const updated = prev.map((device) =>
        device.id === selectedDeviceId
          ? {
              ...device,
              state: {
                ...(device.state ?? {}),
                ...update,
              },
            }
          : device,
      )
      const updatedDevice = updated.find((d) => d.id === selectedDeviceId)
      console.log('[App] applyOptimisticUpdate - after update:', {
        oldBrightness: prev.find((d) => d.id === selectedDeviceId)?.state?.brightness,
        newBrightness: updatedDevice?.state?.brightness,
        fullState: updatedDevice?.state,
      })
      return updated
    })
  }

  const commitDeviceUpdate = async (deviceId, update, options = {}) => {
    if (!deviceId) return

    console.log('[App] commitDeviceUpdate called:', {
      deviceId,
      update,
      updateBrightness: update.brightness,
      options,
    })

    try {
      const updatedDevice = await api.updateDeviceState(deviceId, update)
      console.log('[App] commitDeviceUpdate - API response:', {
        updatedDeviceBrightness: updatedDevice.state?.brightness,
        fullState: updatedDevice.state,
      })
      replaceDevice(updatedDevice)
      if (!options?.silent) {
        setMessage('Device updated.')
      }
    } catch (err) {
      console.error('[App] commitDeviceUpdate - error:', err)
      setError(err instanceof Error ? err.message : 'Failed to update device.')
      await loadDevices(false)
    }
  }

  const handleStateChange = async (update, options = {}) => {
    if (!selectedDevice) {
      console.log('[App] handleStateChange - no selectedDevice')
      return
    }

    console.log('[App] handleStateChange called:', {
      update,
      updateBrightness: update.brightness,
      currentDeviceBrightness: selectedDevice.state?.brightness,
      options,
      selectedDeviceId,
    })

    applyOptimisticUpdate(update)

    if (options.debounce) {
      pendingUpdateRef.current = {
        ...(pendingUpdateRef.current ?? {}),
        ...update,
      }

      console.log('[App] handleStateChange - debounced, pendingUpdate:', pendingUpdateRef.current)

      if (pendingTimeoutRef.current) {
        window.clearTimeout(pendingTimeoutRef.current)
      }

      const deviceId = selectedDeviceId
      pendingTimeoutRef.current = window.setTimeout(async () => {
        if (!pendingUpdateRef.current || !deviceId) {
          console.log('[App] handleStateChange - debounce timeout cancelled:', {
            hasPendingUpdate: !!pendingUpdateRef.current,
            deviceId,
          })
          return
        }
        const payload = pendingUpdateRef.current
        console.log('[App] handleStateChange - debounce timeout firing, committing:', payload)
        pendingUpdateRef.current = null
        pendingTimeoutRef.current = null
        await commitDeviceUpdate(deviceId, payload, { silent: true })
      }, 200)

      return
    }

    if (pendingTimeoutRef.current) {
      window.clearTimeout(pendingTimeoutRef.current)
      pendingTimeoutRef.current = null
    }
    pendingUpdateRef.current = null

    if (!options.silent) {
      setBusy(true)
    }
    await commitDeviceUpdate(selectedDevice.id, update, options)
    if (!options.silent) {
      setBusy(false)
    }
  }

  const handleClear = async () => {
    if (!selectedDevice) return

    const resetState = isLightDevice(selectedDevice)
      ? { power: false, brightness: 0 }
      : { power: false, speed: 0 }

    await handleStateChange(resetState, { silent: true })
    setMessage('Device reset.')
  }

  const handleSavePreset = async () => {
    if (!selectedDevice) return

    const defaultName = `${selectedDevice.name} preset`
    const name = window.prompt('Preset name', defaultName)?.trim()

    if (!name) {
      return
    }

    setBusy(true)

    try {
      const preset = await api.savePreset({
        deviceId: selectedDevice.id,
        name,
        state: selectedDevice.state,
      })

      setDevices((prev) =>
        prev.map((device) =>
          device.id === selectedDevice.id
            ? { ...device, presets: [preset, ...device.presets] }
            : device,
        ),
      )

      setMessage('Preset saved.')
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Failed to save preset.')
    } finally {
      setBusy(false)
    }
  }

  const handleApplyPreset = async (preset) => {
    if (!selectedDevice) return

    setBusy(true)

    try {
      const updatedDevice = await api.applyPreset(selectedDevice.id, preset.id)
      replaceDevice(updatedDevice)
      setMessage(`Preset "${preset.name}" applied.`)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Failed to apply preset.')
    } finally {
      setBusy(false)
    }
  }

  const handleDeletePreset = async (preset) => {
    setBusy(true)
    try {
      await api.deletePreset(preset.id)
      setDevices((prev) =>
        prev.map((device) =>
          device.id === preset.device_id
            ? { ...device, presets: device.presets.filter((item) => item.id !== preset.id) }
            : device,
        ),
      )
      setMessage('Preset removed.')
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Failed to delete preset.')
    } finally {
      setBusy(false)
    }
  }

  if (loading && devices.length === 0) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading device sandbox…</p>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <DeviceSidebar
        devices={devices}
        selectedDeviceId={selectedDeviceId}
        onSelectDevice={setSelectedDeviceId}
        presets={selectedDevice?.presets ?? []}
        onApplyPreset={handleApplyPreset}
        onDeletePreset={handleDeletePreset}
      />

      <main className="main-panel">
        <header className="panel-header">
          <div>
            <h1>Testing Canvas</h1>
            <p>Interact with your smart devices in a safe sandbox environment.</p>
          </div>
          <div className="panel-actions">
            <button
              type="button"
              className="ghost-button"
              onClick={() => loadDevices(false)}
              disabled={busy}
            >
              Refresh
            </button>
            <button
              type="button"
              className="ghost-button"
              onClick={handleClear}
              disabled={busy || !selectedDevice}
            >
              Clear
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={handleSavePreset}
              disabled={busy || !selectedDevice}
            >
              Save Preset
            </button>
          </div>
        </header>

        {(message || error) && (
          <div className="toast-stack">
            {message && (
              <div className="toast success" role="status">
                {message}
              </div>
            )}
            {error && (
              <div className="toast error" role="alert">
                {error}
              </div>
            )}
          </div>
        )}

        <section className="canvas-section">
          <DeviceCanvas device={selectedDevice} />
        </section>

        <section className="controls-section">
          <DeviceControls
            device={selectedDevice}
            onStateChange={handleStateChange}
            disabled={busy}
          />
        </section>
      </main>
    </div>
  )
}

export default App

