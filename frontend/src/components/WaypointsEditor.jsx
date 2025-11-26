// frontend/src/components/WaypointEditor.jsx
import React from 'react'

export default function WaypointEditor({ waypoints, setWaypoints }){
  function update(i,k,v){ const arr = [...waypoints]; arr[i][k] = v; setWaypoints(arr) }
  function add(){ setWaypoints([...waypoints, {ident:'WP', lat:0, lon:0}]) }
  function remove(i){ setWaypoints(waypoints.filter((_,idx)=>idx!==i)) }
  return (
    <div>
      <div style={{fontWeight:700}}>Waypoints</div>
      <div style={{marginTop:6}}>
        {waypoints.map((w,i)=>(
          <div key={i} style={{display:'flex',gap:8,marginBottom:6}}>
            <input style={{width:80}} value={w.ident} onChange={e=>update(i,'ident',e.target.value)} />
            <input style={{width:120}} value={w.lat} onChange={e=>update(i,'lat',Number(e.target.value))} />
            <input style={{width:120}} value={w.lon} onChange={e=>update(i,'lon',Number(e.target.value))} />
            <button className="button" onClick={()=>remove(i)}>Remove</button>
          </div>
        ))}
        <div style={{marginTop:8}}><button className="button" onClick={add}>Add Waypoint</button></div>
      </div>
    </div>
  )
}

