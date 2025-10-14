import math

# Earth radius in nautical miles
R_NM = 3440.065

def haversine_nm(lat1, lon1, lat2, lon2):
    """Return great-circle distance between two lat/lon points in nautical miles."""
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)

    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R_NM * c

def waypoint_offset(lat, lon, bearing_deg, distance_nm):
    """Compute destination point from start point, bearing and distance (nm).
    Returns (lat2, lon2) in degrees using great-circle formulas.
    """
    ang = math.radians(bearing_deg)
    phi1 = math.radians(lat)
    lam1 = math.radians(lon)
    d = distance_nm / R_NM

    phi2 = math.asin(math.sin(phi1)*math.cos(d) + math.cos(phi1)*math.sin(d)*math.cos(ang))
    lam2 = lam1 + math.atan2(math.sin(ang)*math.sin(d)*math.cos(phi1),
                              math.cos(d) - math.sin(phi1)*math.sin(phi2))

    return math.degrees(phi2), math.degrees((lam2 + 3*math.pi) % (2*math.pi) - math.pi)
