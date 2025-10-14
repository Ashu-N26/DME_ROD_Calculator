# DME & ROD Calculator

This project computes slant distances (DME), horizontal distances between waypoints, required gradients and rates of descent (ROD) for approach procedures (ILS, RNAV, VOR, NDB).

## Run locally (dev)

1. Start backend:

```bash
cd backend
python app.py
```

2. Start frontend:

```bash
cd frontend
npm install
npm run dev
```

## API
POST /api/compute with JSON:

```
{
  "from": {"lat":.., "lon":.., "alt_ft":..},
  "to": {"lat":.., "lon":.., "alt_ft":..},
  "groundspeed_kts": 140
}
```

## Notes on logic
- Horizontal distance uses haversine (great-circle) and returns NM.
- Slant (DME) uses straight-line distance combining horizontal NM and vertical ft converted to NM.
- Required gradient computed as ft per NM and angle in degrees.
- ROD uses the formula: ROD (ft/min) = GS(kts) * tan(angle) * 6076.12/60.
