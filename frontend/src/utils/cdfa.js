// frontend/src/utils/cdfa.js
// CDFA, DME & ROD math for client-side usage

const NM_TO_FT = 6076.12;
const EARTH_RADIUS_M = 6371000.0;
const M_TO_NM = 1.0 / 1852.0;

// ------- geometry helpers -------
export function nmToFeet(nm){ return nm * NM_TO_FT }
export function feetToNm(ft){ return ft / NM_TO_FT }

// Haversine in NM
export function haversineNm(lat1, lon1, lat2, lon2){
  const toRad = (d) => d * Math.PI / 180.0;
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const dphi = toRad(lat2 - lat1);
  const dlambda = toRad(lon2 - lon1);
  const a = Math.sin(dphi/2.0)**2 + Math.cos(phi1)*Math.cos(phi2)*Math.sin(dlambda/2.0)**2;
  const c = 2 * Math.asin(Math.min(1.0, Math.sqrt(a)));
  const meters = EARTH_RADIUS_M * c;
  return meters * M_TO_NM;
}

// slant distance in NM given horizontal and altitude diff (ft)
export function computeSlantNm(horizontalNm, altitudeFtAboveStation){
  return Math.sqrt(Math.max(0, horizontalNm*horizontalNm) + (altitudeFtAboveStation / NM_TO_FT)**2);
}

// ------- angle computations -------
export function computeAngleFromTOD(todAltFt, todDistNm, thrTargetAltFt){
  if(!todDistNm || todDistNm <= 0) return 0.0;
  const vertFt = Math.abs(todAltFt - thrTargetAltFt);
  // angle = atan2(vertical_ft, horizontal_ft)
  return radiansToDegrees(Math.atan2(vertFt, todDistNm * NM_TO_FT));
}

export function computeAngleFromSDFs(sdfs, thrTargetAltFt){
  let best = 0.0;
  (sdfs || []).forEach(s => {
    const d = Number(s.dist || 0.0);
    const a = Number(s.alt || 0.0);
    if(d <= 0) return;
    const vertFt = Math.abs(a - thrTargetAltFt);
    const ang = radiansToDegrees(Math.atan2(vertFt, d * NM_TO_FT));
    if(ang > best) best = ang;
  });
  return best;
}

export function choosePublishedAngle(originalAngleDeg, overrideAngleDeg=null){
  let published = (overrideAngleDeg !== null && overrideAngleDeg !== undefined) ? Number(overrideAngleDeg) : Number(originalAngleDeg || 0.0);
  let raised = false;
  if(published < 2.5){
    published = 3.0;
    raised = true;
  }
  return { published, raised };
}

export function adjustAngleForSDFConstraints(initialAngleDeg, thrTargetAltFt, sdfs, maxAngleDeg=10.0, stepDeg=0.1){
  let angle = Number(initialAngleDeg);
  let changed = false;
  for(let i=0; i <= Math.floor((maxAngleDeg - angle)/stepDeg) + 1; i++){
    let ok = true;
    const aRad = degreesToRadians(angle);
    for(const s of (sdfs || [])){
      const sd = Number(s.dist || 0.0);
      const sAlt = Number(s.alt || 0.0);
      const compAlt = thrTargetAltFt + Math.tan(aRad) * (sd * NM_TO_FT);
      if(compAlt + 0.0001 < sAlt){ ok = false; break; }
    }
    if(ok) break;
    angle += stepDeg;
    changed = true;
    if(angle > maxAngleDeg) break;
  }
  return { angle, changed };
}

export function generateTableHorizontal(thrElevFt, thrTargetAltFt, publishedAngleDeg, maxEntries=8, maxDistanceNm=null, startNearThrNm=0.5){
  const aRad = degreesToRadians(publishedAngleDeg);
  if(!maxDistanceNm) maxDistanceNm = Math.max((maxEntries - 1) * 0.5, 1.0);
  if(startNearThrNm >= maxDistanceNm) startNearThrNm = maxDistanceNm / Math.max(1, maxEntries);
  let distances = [];
  if(maxEntries === 1) distances = [startNearThrNm];
  else {
    const step = (maxDistanceNm - startNearThrNm) / Math.max(1, maxEntries - 1);
    for(let i=0;i<maxEntries;i++) distances.push(round(startNearThrNm + i*step, 5));
  }
  const rows = distances.map(d => {
    const altFt = thrTargetAltFt + Math.tan(aRad) * (d * NM_TO_FT);
    const altPub = ceilTo10Ft(altFt);
    return {
      distFromThrNm: round(d,4),
      altExactFt: round(altFt, 2),
      altPublishedFt: altPub
    };
  });
  return rows;
}

export function generateDmeTable(thrElevFt, dmeToThrNm, thrTargetAltFt, publishedAngleDeg, maxEntries=8, maxDistanceNm=null, startNearThrNm=0.5){
  const base = generateTableHorizontal(thrElevFt, thrTargetAltFt, publishedAngleDeg, maxEntries, maxDistanceNm, startNearThrNm);
  return base.map(r => {
    let dmeReading = null, slantNm = null;
    if(dmeToThrNm !== null && dmeToThrNm !== undefined){
      dmeReading = round(dmeToThrNm - r.distFromThrNm, 4);
      const altAboveStation = r.altExactFt - thrElevFt;
      slantNm = round(computeSlantNm(Math.abs(dmeReading), altAboveStation), 6);
    }
    return { ...r, dmeReadingNm: dmeReading, slantNm };
  });
}

export function computeRodTable(publishedAngleDeg, groundspeedsKts=[80,90,100,120,140,160]){
  const aRad = degreesToRadians(publishedAngleDeg);
  const verticalPerNm = NM_TO_FT * Math.tan(aRad); // ft per NM
  return groundspeedsKts.map(gs => {
    const rod = verticalPerNm * (gs / 60.0);
    return { gsKts: Number(gs), rodFpm: Math.round(rod) };
  });
}

// helpers
function round(v, s=2){ return Math.round((v + Number.EPSILON) * Math.pow(10,s)) / Math.pow(10,s); }
function ceilTo10Ft(alt){ return Math.ceil(alt/10.0)*10; }
function degreesToRadians(d){ return d * Math.PI / 180.0; }
function radiansToDegrees(r){ return r * 180.0 / Math.PI; }
