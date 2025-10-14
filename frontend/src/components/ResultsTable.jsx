import React from 'react'

export default function ResultsTable({ data }){
  const slant = data.slant || data.slant_distance || {}
  return (
    <div className="results">
      <h2>Results</h2>
      <table>
        <tbody>
          <tr><td>Horizontal distance (NM)</td><td>{data.horizontal_nm}</td></tr>
          <tr><td>Slant distance (NM)</td><td>{slant.slant_nm || slant}</td></tr>
          <tr><td>Vertical difference (ft)</td><td>{slant.vertical_ft || (data.gradient && data.gradient.vert_ft)}</td></tr>
          <tr><td>Angle (deg)</td><td>{data.angle_deg ?? '—'}</td></tr>
          <tr><td>ROD (fpm)</td><td>{data['rod_fpm_at_140kts'] ?? 'See payload'}</td></tr>
        </tbody>
      </table>
      <pre style={{whiteSpace: 'pre-wrap'}}>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
