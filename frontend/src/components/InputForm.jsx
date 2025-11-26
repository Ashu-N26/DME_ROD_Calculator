// frontend/src/components/InputForm.jsx
import React, { useState } from 'react'
import WaypointEditor from './WaypointEditor'
import { computeAngleFromTOD, // not used here - use from cdfa util
  computeAngleFromTOD as dummy } from '../utils/cdfa' // placeholder import to avoid lint errors

export default function InputForm({ onCompute }) {
  const [ident, setIdent] = useState('RWY24')
  const [gpAngle, setGpAngle] = useState('')
  const [thrElev, setThrElev] = useState(15)
  const [dmeAtThr, setDmeAtThr] = useState(4.0)
  const [todAlt, setTodAlt] = useState(3000)
  const [todDist, setTodDist] = useState(8.0)
  const [mda, setMda] = useState(620)
  const [fafDist, setFafDist] = useState(2.8)
  const [sdfs, setSdfs] = useState([{dist:6.0, alt:1500},{dist:4.5, alt:1000}])
  const [useWaypoints, setUseWaypoints] = useState(false)
  const [thrLat, setThrLat] = useState('')
  const [thrLon, setThrLon] = useState('')
  const [waypoints, setWaypoints] = useState([])

  function updateSdf(i, k, v){
    const arr = [...sdfs]; arr[i][k] = v; setSdfs(arr)
  }
  function addSdf(){ setSdfs([...sdfs, {dist:3.0, alt:1200}]) }
  function removeSdf(i){ setSdfs(sdfs.filter((_,idx) => idx!==i)) }

  return (
    <div className="card">
      <div style={{display:'flex', gap:12}}>
        <div style={{flex:1}}>
          <div className="form-grid">
            <div className="field"><label>IDENT</label><input value={ident} onChange={e=>setIdent(e.target.value)} /></div>
            <div className="field"><label>GP Angle (°) — optional</label><input value={gpAngle} onChange={e=>setGpAngle(e.target.value)} /></div>
            <div className="field"><label>THR / TDZE Elevation (ft)</label><input type="number" value={thrElev} onChange={e=>setThrElev(e.target.value)} /></div>
            <div className="field"><label>DME reading at THR (nm)</label><input type="number" step="0.01" value={dmeAtThr} onChange={e=>setDmeAtThr(e.target.value)} /></div>
            <div className="field"><label>Top of Descent Altitude (ft)</label><input type="number" value={todAlt} onChange={e=>setTodAlt(e.target.value)} /></div>
            <div className="field"><label>Top of Descent Dist from THR (nm)</label><input type="number" step="0.01" value={todDist} onChange={e=>setTodDist(e.target.value)} /></div>
            <div className="field"><label>MDA (ft)</label><input type="number" value={mda} onChange={e=>setMda(e.target.value)} /></div>
            <div className="field"><label>FAF - MAPt Dist (nm)</label><input type="number" step="0.01" value={fafDist} onChange={e=>setFafDist(e.target.value)} /></div>
          </div>

          <div style={{marginTop:10}}>
            <label style={{fontWeight:700}}>SDFs (optional)</label>
            <div style={{marginTop:6}}>
              {sdfs.map((s,i)=>(
                <div className="sdf-row" key={i}>
                  <input style={{width:100}} type="number" step="0.01" value={s.dist} onChange={e=>updateSdf(i,'dist',Number(e.target.value))}/>
                  <input style={{flex:1}} type="number" value={s.alt} onChange={e=>updateSdf(i,'alt',Number(e.target.value))}/>
                  <button className="button" onClick={()=>removeSdf(i)}>Remove</button>
                </div>
              ))}
              <div style={{marginTop:8}}>
                <button className="button" onClick={addSdf}>Add SDF</button>
              </div>
            </div>
          </div>
        </div>

        <div style={{width:360}}>
          <div className="card">
            <div style={{fontWeight:800,fontSize:15,color:'#dff7f0'}}>Waypoints / LNAV</div>
            <div style={{marginTop:8}}>
              <label><input type="checkbox" checked={useWaypoints} onChange={e=>setUseWaypoints(e.target.checked)} /> Use Waypoints (LNAV)</label>
            </div>
            {useWaypoints && (
              <div style={{marginTop:8}}>
                <div className="field"><label>THR Lat</label><input value={thrLat} onChange={e=>setThrLat(e.target.value)} /></div>
                <div className="field"><label>THR Lon</label><input value={thrLon} onChange={e=>setThrLon(e.target.value)} /></div>
                <WaypointEditor waypoints={waypoints} setWaypoints={setWaypoints} />
              </div>
            )}

            <div style={{marginTop:10}}>
              <label>Groundspeeds (kts) comma separated</label>
              <input defaultValue="80,100,120,140" onBlur={e=>{/* handled by parent via compute */}} />
            </div>

            <div style={{marginTop:10,display:'flex',gap:8}}>
              <button className="button" onClick={()=>{
                // build payload and call onCompute
                const payload = {
                  ident,
                  gpAngle: gpAngle? Number(gpAngle) : null,
                  thrElev: Number(thrElev),
                  dmeAtThr: dmeAtThr!==''? Number(dmeAtThr) : null,
                  todAlt: Number(todAlt),
                  todDist: Number(todDist),
                  mda: Number(mda),
                  sdfs,
                  fafDist: fafDist? Number(fafDist) : null,
                  grounds: [80,100,120,140,160],
                  useWaypoints,
                  thrLat: useWaypoints? Number(thrLat) : null,
                  thrLon: useWaypoints? Number(thrLon) : null,
                  waypoints
                }
                onCompute(payload)
              }}>Calculate</button>
              <button className="button" onClick={()=>{
                // reset
                setIdent('RWY24'); setGpAngle(''); setThrElev(15); setDmeAtThr(4.0);
                setTodAlt(3000); setTodDist(8.0); setMda(620); setFafDist(2.8);
                setSdfs([{dist:6.0,alt:1500},{dist:4.5,alt:1000}]); setUseWaypoints(false); setWaypoints([]);
              }}>Reset</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

