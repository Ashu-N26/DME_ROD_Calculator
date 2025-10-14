from logic.dme_rod_calculator import horizontal_distance_nm, slant_distance_nm, rate_of_descent_fpm

def test_horizontal_distance():
    d = horizontal_distance_nm(0.0, 0.0, 0.01, 0.0)
    assert d > 0

def test_slant_distance():
    s = slant_distance_nm(0.0, 0.0, 10000, 0.01, 0.0, 0)
    assert s['slant_nm'] > s['horizontal_nm']

def test_rod_formula():
    fpm = rate_of_descent_fpm(120, angle_deg=3.0)
    assert fpm > 0
