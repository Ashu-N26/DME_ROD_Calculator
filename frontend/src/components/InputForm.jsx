import React, { useState } from 'react'
import { computeProfile } from '../api/api'

export default function InputForm({ onResult }){
  const [from, setFrom] = useState({lat: '', lon: '', alt_ft: ''})
  const [to, setTo] = useState({lat: '', lon: '', alt_ft: ''})
  const [gs, setGs] = useState(140)

  function update(obj, setter, field, value){
    setter({...obj, [field]: value})
  }

  async function submit(e){
    e.preventDefault()
    const payload = {
      from: {lat: parseFloat(from.lat), lon: parseFloat(from.lon), alt_ft: parseFloat(from.alt_ft)},
      to:   {lat: parseFloat(to.lat),   lon: parseFloat(to.lon),   alt_ft: parseFloat(to.alt_ft)},
      groundspeed_kts: parseFloat(gs)
    }
    const res = await computeProfile(payload)
    onResult(res)
  }

  return (
    <form onSubmit={submit} className="form">
      <fieldset>
        <legend>From (aircraft)</legend>
        <label>Lat <input value={from.lat} onChange={e => update(from, setFrom, 'lat', e.target.value)} /></label>
        <label>Lon <input value={from.lon} onChange={e => update(from, setFrom, 'lon', e.target.value)} /></label>
        <label>Alt (ft) <input value={from.alt_ft} onChange={e => update(from, setFrom, 'alt_ft', e.target.value)} /></label>
      </fieldset>

      <fieldset>
        <legend>To (station / waypoint)</legend>
        <label>Lat <input value={to.lat} onChange={e => update(to, setTo, 'lat', e.target.value)} /></label>
        <label>Lon <input value={to.lon} onChange={e => update(to, setTo, 'lon', e.target.value)} /></label>
        <label>Alt (ft) <input value={to.alt_ft} onChange={e => update(to, setTo, 'alt_ft', e.target.value)} /></label>
      </fieldset>

      <label>Groundspeed (kts) <input value={gs} onChange={e => setGs(e.target.value)} /></label>
      <button type="submit">Compute</button>
    </form>
  )
}
