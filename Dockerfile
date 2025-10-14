# multi-stage build: backend + frontend served by gunicorn + static built frontend
FROM python:3.11-slim AS backend-build
WORKDIR /app
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .

FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# final image
FROM python:3.11-slim
WORKDIR /app
COPY --from=backend-build /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=backend-build /app /app/backend
COPY --from=frontend-build /app/dist /app/backend/static
ENV PYTHONPATH=/app/backend
WORKDIR /app/backend
EXPOSE 5000
CMD ["gunicorn", "wsgi:app", "-b", "0.0.0.0:5000", "--workers", "2"]
