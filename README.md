# venderivigen-tempest-proxy

A tiny Express + TypeScript server that exposes a `/api/real-time` endpoint backed by the Home Assistant REST API. It fetches the latest state for a configured list of sensors and returns them in a lightweight JSON payload that is safe to share publicly.

## Prerequisites

- Node.js 20+ (used for both local dev and the production Docker image)
- A Home Assistant base URL and Long-Lived Access Token with permission to read sensor state

## Configuration

Copy the example file and fill in your own values:

```bash
cp .env.example .env
```

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | HTTP port to bind locally (defaults to `8080`). |
| `HA_BASE_URL` | Yes | Base URL of your Home Assistant instance, e.g. `https://ha.example.com:8123`. |
| `HA_TOKEN` | Yes | Long-Lived Access Token created in Home Assistant. |
| `HA_SENSORS` | Yes | Comma-separated list of sensor entity IDs to fetch when no query parameter is provided. |
| `HA_TIMEOUT_MS` | No | Milliseconds to wait for Home Assistant before timing out (default `5000`). |

You can override the configured sensors on a per-request basis with `?sensors=sensor.one,sensor.two`.

## Local development

```bash
npm install
npm run dev
```

The dev server watches `src/**/*.ts`. For production-style runs, build once and execute the compiled files:

```bash
npm run build
npm start
```

## API

`GET /api/real-time`

- Optional `sensors` query parameter (comma-separated) overrides the default sensor list.
- Successful responses resemble:

```json
{
  "refreshedAt": "2024-01-30T18:25:43.511Z",
  "total": 2,
  "sensors": [
    {
      "id": "sensor.outdoor_temperature",
      "state": "4.5",
      "lastChanged": "2024-01-30T18:22:01.123Z",
      "lastUpdated": "2024-01-30T18:22:01.123Z",
      "attributes": {
        "unit_of_measurement": "°C",
        "friendly_name": "Outdoor Temperature"
      },
      "friendlyName": "Outdoor Temperature"
    }
  ]
}
```

- Errors from Home Assistant bubble up with a `502` status and include the failing sensor id.

A basic `GET /healthz` endpoint is also available for load-balancer checks.

## Docker

Build and run the production image locally:

```bash
docker build -t tempest-proxy .
docker run --rm \
  -p 8080:8080 \
  -e PORT=8080 \
  -e HA_BASE_URL=https://ha.example.com:8123 \
  -e HA_TOKEN=YOUR_TOKEN \
  -e HA_SENSORS=sensor.one,sensor.two \
  tempest-proxy
```

The container exposes port `8080` by default and starts `node dist/index.js` with only the runtime dependencies installed.
