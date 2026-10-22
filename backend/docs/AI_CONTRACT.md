# AI service contract (backend <-> FastAPI)

**Status: PROPOSED.** The AI team member must confirm or change this. The backend validates every response, so a
change is cheap now and expensive later. Agree the final JSON, then update `src/services/ai/aiContract.js`.

## Request: `POST {AI_SERVICE_URL}/predict`

Headers: `Content-Type: application/json`, and `X-API-Key: <AI_SERVICE_API_KEY>` if a key is configured.

```json
{
  "reportId": "rpt-0012",
  "imageUrl": "http://localhost:5000/uploads/3f2a....jpg",
  "crop": "Tomato",
  "variety": "Roma",
  "growthStage": "Flowering",
  "symptoms": ["Brown or black spots", "Yellowing leaves"],
  "notes": "started after the rain",
  "location": { "lat": 19.12, "lng": 72.85 },
  "weather": null
}
```

- `imageUrl` is a link the AI service must be able to download. With Cloudinary it is a public https link. With the
  local development fallback it points at the backend (`localhost:5000`), so the AI service must run on the same machine.
- `variety` and `notes` can be `null`. `weather` is `null` until the weather integration exists; later it will be
  `{ "temperatureC": 28, "humidity": 74, "rainfallMm": 12 }`.
- No farmer name, email or phone is ever sent.

## Response: `200 OK`

```json
{
  "disease": "Early Blight",
  "diseaseConfidence": 0.91,
  "pest": "Aphid",
  "pestConfidence": 0.87,
  "riskLevel": "High",
  "modelVersion": "efficientnet-v1"
}
```

| Field | Rules |
|---|---|
| `disease` | text, or `null` if no disease. The strings "Healthy" / "None" are treated as `null` |
| `diseaseConfidence` | number from 0 to 1. Required when `disease` is given |
| `pest` | text, or `null` if no pest |
| `pestConfidence` | number from 0 to 1. Required when `pest` is given |
| `riskLevel` | exactly `Low`, `Medium` or `High` (any letter case) |
| `modelVersion` | optional text, stored for traceability |

Anything else (wrong type, confidence outside 0 to 1, missing `riskLevel`, non-JSON, non-200 status, no answer within
`AI_TIMEOUT_MS`) makes the backend mark that report's analysis as **Failed**. The farmer's report is still saved and
the analysis can be retried with `POST /api/reports/:id/predict`.

## How the backend maps this for the frontend

The frontend shows one headline issue: a `disease` wins, otherwise a `pest` ("Aphid infestation"), otherwise "No clear
issue found". `confidence` is the confidence of that headline finding.

## Minimal FastAPI skeleton (for the AI developer)

```python
from typing import Optional, List
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Location(BaseModel):
    lat: float
    lng: float

class PredictRequest(BaseModel):
    reportId: str
    imageUrl: str
    crop: str
    variety: Optional[str] = None
    growthStage: str
    symptoms: List[str] = []
    notes: Optional[str] = None
    location: Location
    weather: Optional[dict] = None

@app.post("/predict")
def predict(req: PredictRequest):
    # download req.imageUrl, run the model, then return:
    return {"disease": "Early Blight", "diseaseConfidence": 0.91, "pest": None,
            "pestConfidence": None, "riskLevel": "High", "modelVersion": "v1"}
```

## Mock mode vs real mode

- **Mock mode** (default when `AI_SERVICE_URL` is empty): the backend itself simulates a result from the ticked
  symptoms. It never looks at the photo. Stored with `source = MOCK`; the API returns `predictionSource: "mock"` and
  `isMock: true`.
- **Real mode** (`AI_SERVICE_URL` set): stored with `source = AI_SERVICE`; the API returns `"ai-service"`.
- `scripts/mock-ai-service.mjs` is a stand-in HTTP server for testing real mode and its failures before the models
  exist. Its output is still simulated, which is why its responses carry `modelVersion: "stand-in-service-v1"`.
