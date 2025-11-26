// frontend/src/components/ResultsTable.jsx
import React from 'react'

export default function ResultsTable({ result }){
  if(!result) return null
  return (
    <div style={{display:'flex', gap:12, marginTop:12}}>
      <div className="dme-table card">
        <div style={{fontWeight:800,fontSize:16,color:'#dff7f0'}}>DIST / ALT Table</div>
        <div className="small-muted">GP: {result.publishedAngle_deg}° · THR target: {result.thrTargetAlt_ft} ft</div>
        <table style={{marginTop:12}}>
          <thead><tr><th>DME (nm)</th><th>Dist from THR (nm)</th><th>Alt (ft)</th><th>Slant (nm)</th></tr></thead>
          <tbody>
            {result.dmeTable.map((r,i)=>(
              <tr key={i}>
                <td>{r.dmeReadingNm !== null && r.dmeReadingNm !== undefined ? Number(r.dmeReadingNm).toFixed(2) : '-'}</td>
                <td>{Number(r.distFromThrNm).toFixed(2)}</td>
                <td><span className="alt-bold">{r.altPublishedFt}</span></td>
                <td>{r.slantNm !== null && r.slantNm !== undefined ? Number(r.slantNm).toFixed(3) : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rod-table card" style={{width:420}}>
        <div style={{fontWeight:800,fontSize:16,color:'#dff7f0'}}>ROD Table & FAF → MAPt</div>
        <div className="small-muted" style={{marginTop:6}}>Published angle: {result.publishedAngle_deg}°</div>
        <table style={{marginTop:12}}>
          <thead><tr><th>GS (kts)</th><th>ROD (fpm)</th><th>FAF → MAPt</th></tr></thead>
          <tbody>
            {result.rodTable.map((r,i)=>(
              <tr key={i}><td>{r.gsKts}</td><td className="alt-bold">{r.rodFpm}</td><td>{r.fafMaptTime || '-'}</td></tr>
            ))}
          </tbody>
        </table>
        <div style={{marginTop:10}} className="small-muted">Note: times show FAF→MAPt at given GS; RODs computed using trig formula.</div>
      </div>
    </div>
  )
}

