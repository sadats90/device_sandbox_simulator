const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  (import.meta.env?.MODE === 'development' ? 'http://localhost:8000/api' : '/api')

async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`
  const headers = new Headers(options.headers ?? {})
  headers.set('Accept', 'application/json')

  if (options.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  const text = await response.text()
  
  if (!text) {
    return null
  }

  if (!text.trim().startsWith('{') && !text.trim().startsWith('[')) {
    console.error('[API] Received non-JSON response:', {
      url,
      status: response.status,
      contentType: response.headers.get('content-type'),
      text: text.substring(0, 200),
    })
    throw new Error(`API returned HTML instead of JSON. Check if /api routes are working. Status: ${response.status}`)
  }

  let payload
  try {
    payload = JSON.parse(text)
  } catch (e) {
    console.error('[API] JSON parse error:', {
      url,
      text: text.substring(0, 200),
      error: e.message,
    })
    throw new Error(`Invalid JSON response from API: ${e.message}`)
  }

  if (!response.ok) {
    const message =
      payload?.message ??
      payload?.error ??
      response.statusText ??
      'Something went wrong.'
    throw new Error(message)
  }

  return payload
}

async function getDevices() {
  const { data } = await request('/devices')
  return data
}

async function updateDeviceState(deviceId, state) {
  const { data } = await request(`/devices/${deviceId}/state`, {
    method: 'POST',
    body: JSON.stringify(state),
  })

  return data
}

async function savePreset(args) {
  const { data } = await request('/presets', {
    method: 'POST',
    body: JSON.stringify({
      device_id: args.deviceId,
      name: args.name,
      state: args.state,
    }),
  })

  return data
}

async function deletePreset(presetId) {
  await request(`/presets/${presetId}`, {
    method: 'DELETE',
  })
}

async function applyPreset(deviceId, presetId) {
  const { data } = await request(
    `/devices/${deviceId}/apply-preset/${presetId}`,
    {
      method: 'POST',
    },
  )

  return data
}

export const api = {
  getDevices,
  updateDeviceState,
  savePreset,
  deletePreset,
  applyPreset,
}

