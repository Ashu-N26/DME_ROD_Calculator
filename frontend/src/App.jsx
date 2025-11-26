// frontend/src/App.jsx
import React, { useState } from 'react'
import InputForm from './components/InputForm'
import ResultsTable from './components/ResultsTable'
import WaypointEditor from './components/WaypointEditor'
import * as cdfa from './utils/cdfa'

export default function App(){
  const [result, setResult] = useState(null)
  const [warnings, setWarnings] = useState([])

  async function onCompute(payload){
    // Do client-side computation using cdfa utils
    const thrElev = Number(payload.thrElev || 0)
    const thrTargetAlt = thrElev + 50.0
    const angleFromTOD = cdfa.computeAngleFromTOD(payload.todAlt, payload.todDist, thrTargetAlt)
    const angleFromSDF = cdfa.computeAngleFromSDFs(payload.sdfs || [], thrTargetAlt)
    let originalAngle = Math.max(angleFromTOD, angleFromSDF)
    if(payload.gpAngle !== null && payload.gpAngle !== undefined) originalAngle = Number(payload.gpAngle)
    const { published, raised } = cdfa.choosePublishedAngle(originalAngle, payload.gpAngle)
    const { angle: finalAngle, changed } = cdfa.adjustAngleForSDFConstraints(published, thrTargetAlt, payload.sdfs || [])
    // choose candidate max distance
    let candidateMax = 0.0
    if(payload.useWaypoints && payload.waypoints && payload.waypoints.length && payload.thrLat && payload.thrLon){
      const wpDists = payload.waypoints.map(w => cdfa.haversineNm(Number(w.lat), Number(w.lon), Number(payload.thrLat), Number(payload.thrLon)))
      candidateMax = Math.max(...wpDists, payload.todDist || 0, payload.fafDist || 0)
    } else {
      candidateMax = Math.max(payload.todDist || 0, ...(payload.sdfs || []).map(s=>s.dist || 0), payload.fafDist || 0)
    }
    if(candidateMax < 1.0) candidateMax = Math.max(1.0, (8 - 1) * 0.5)

    let dmeTable = []
    if(payload.useWaypoints && payload.waypoints && payload.waypoints.length && payload.thrLat && payload.thrLon){
      // include waypoint distances and generate horizontal table
      const waypointDistances = payload.waypoints.map(w => ({
        ident: w.ident || '',
        distToThrNm: round(cdfa.haversineNm(Number(w.lat), Number(w.lon), Number(payload.thrLat), Number(payload.thrLon)), 4)
      }))
      dmeTable = cdfa.generateTableHorizontal(thrElev, thrTargetAlt, finalAngle, 8, candidateMax, 0.5).map(r => ({...r, dmeReadingNm: null, slantNm: null}))
      // annotate markers
      dmeTable.forEach(row => {
        row.waypointMarkers = waypointDistances.filter(wp => Math.abs(wp.distToThrNm - row.distFromThrNm) <= 0.25)
      })
    } else {
      const dmeToThr = payload.dmeAtThr !== null && payload.dmeAtThr !== undefined ? Number(payload.dmeAtThr) : null
      dmeTable = cdfa.generateDmeTable(thrElev, dmeToThr, thrTargetAlt, finalAngle, 8, candidateMax, 0.5)
    }

    // ROD table
    const grounds = payload.grounds || [80,100,120,140,160]
    const rodBase = cdfa.computeRodTable(finalAngle, grounds)
    const rodTable = rodBase.map(r => {
      const fafTime = payload.fafDist ? formatTimeForDistance(payload.fafDist, r.gsKts) : null
      return {...r, fafMaptTime: fafTime}
    })

    setWarnings([])
    if(raised) setWarnings(w => [...w, `Computed angle <2.5° — raised to ${finalAngle}°`])
    if(changed) setWarnings(w => [...w, 'Published angle adjusted to satisfy SDF constraints.'])

    setResult({
      ident: payload.ident,
      thrElev_ft: thrElev,
      thrTargetAlt_ft: thrTargetAlt,
      angleFromTOD_deg: round(angleFromTOD,4),
      angleFromSDF_deg: round(angleFromSDF,4),
      originalAngle_deg: round(originalAngle,4),
      publishedAngle_deg: round(finalAngle,4),
      raisedDueToMinRule: raised,
      angleAdjustedForSDF: changed,
      dmeTable,
      rodTable
    })
  }

  function formatTimeForDistance(distanceNm, gsKts){
    if(!distanceNm || !gsKts) return "00:00"
    const hours = distanceNm / gsKts
    const totalSeconds = Math.round(hours * 3600)
    const mm = Math.floor(totalSeconds/60)
    const ss = totalSeconds % 60
    return `${mm.toString().padStart(2,'0')}:${ss.toString().padStart(2,'0')}`
  }

  function round(v,s=2){ return Math.round((v + Number.EPSILON) * Math.pow(10,s)) / Math.pow(10,s) }

  return (
    <div className="container">
      <div className="header">
        <h2 style={{color:'#dff7f0'}}>DME & ROD — CDFA Tool (Client)</h2>
        <div className="small-muted">Runs entirely in the browser — deploy to GitHub Pages</div>
      </div>

      <InputForm onCompute={onCompute} />

      {warnings.length>0 && warnings.map((w,i)=>(<div key={i} className="card" style={{marginTop:10,color:'#ffd7a6'}}>{w}</div>))}

      {result && <ResultsTable result={result} />}

      <div className="card" style={{marginTop:14}}>
        <div style={{fontWeight:700,color:'#dff7f0'}}>Graphical Profile (placeholder)</div>
        <svg className="profile-svg" viewBox="0 0 1000 300" preserveAspectRatio="none">
          {/* Implement plotting using result.dmeTable later */}
        </svg>
      </div>
    </div>
  )
}
