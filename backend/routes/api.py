from flask import Blueprint, request, jsonify
from flask_cors import CORS
from logic.dme_rod_calculator import compute_profile

api_bp = Blueprint('api', __name__)
CORS(api_bp)

@api_bp.route('/compute', methods=['POST'])
def compute():
    data = request.get_json(force=True)
    p_from = data.get('from')
    p_to = data.get('to')
    gs = data.get('groundspeed_kts', 140)

    if not p_from or not p_to:
        return jsonify({'error': 'missing from or to point'}), 400

    try:
        profile = compute_profile(p_from, p_to, groundspeed_kts=gs)
        return jsonify(profile)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
