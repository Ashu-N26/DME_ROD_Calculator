import math
from .waypoint_calc import haversine_nm

FT_PER_NM = 6076.12
CONST_ROD = FT_PER_NM / 60.0  # used for angle -> fpm conversion

def horizontal_distance_nm(lat1, lon1, lat2, lon2):
    return haversine_nm(lat1, lon1, lat2, lon2)

def slant_distance_nm(lat1, lon1, alt1_ft, lat2, lon2, alt2_ft):
    """Compute slant distance (DME) in nautical miles between two points with altitude.
    alt values are in feet above mean sea level.
    """
    horiz_nm = horizontal_distance_nm(lat1, lon1, lat2, lon2)
    vert_ft = abs(alt1_ft - alt2_ft)
    vert_nm = vert_ft / FT_PER_NM
    slant_nm = math.sqrt(horiz_nm**2 + vert_nm**2)
    return {
        'horizontal_nm': horiz_nm,
        'vertical_ft': vert_ft,
        'vertical_nm': vert_nm,
        'slant_nm': slant_nm
    }

def required_gradient(alt_from_ft, alt_to_ft, horiz_nm):
    if horiz_nm == 0:
        return None
    vert_ft = alt_from_ft - alt_to_ft
    grad_ft_per_nm = vert_ft / horiz_nm
    slope_decimal = grad_ft_per_nm / FT_PER_NM
    angle_rad = math.atan2(vert_ft, horiz_nm * FT_PER_NM)
    angle_deg = math.degrees(angle_rad)
    return {
        'vert_ft': vert_ft,
        'ft_per_nm': grad_ft_per_nm,
        'slope_decimal': slope_decimal,
        'angle_deg': angle_deg
    }

def rate_of_descent_fpm(ground_speed_kts, angle_deg=None, vertical_speed_ft_per_nm=None):
    if angle_deg is None and vertical_speed_ft_per_nm is None:
        raise ValueError('Provide angle_deg or vertical_speed_ft_per_nm')

    if vertical_speed_ft_per_nm is not None:
        return ground_speed_kts * vertical_speed_ft_per_nm / 60.0
    else:
        angle_rad = math.radians(angle_deg)
        return ground_speed_kts * math.tan(angle_rad) * CONST_ROD

def compute_profile(point_from, point_to, groundspeed_kts=140):
    hd = horizontal_distance_nm(point_from['lat'], point_from['lon'], point_to['lat'], point_to['lon'])
    sd = slant_distance_nm(point_from['lat'], point_from['lon'], point_from['alt_ft'],
                           point_to['lat'], point_to['lon'], point_to['alt_ft'])
    grad = required_gradient(point_from['alt_ft'], point_to['alt_ft'], hd)

    result = {
        'horizontal_nm': hd,
        'slant': sd,
        'gradient': grad,
    }

    if grad:
        angle = grad['angle_deg']
        rod = rate_of_descent_fpm(groundspeed_kts, angle_deg=angle)
        result['angle_deg'] = angle
        result[f'rod_fpm_at_{groundspeed_kts}kts'] = rod

    return result
