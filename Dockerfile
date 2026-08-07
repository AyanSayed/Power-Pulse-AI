FROM node:20-bullseye

WORKDIR /app

# Copy backend and install Node deps
COPY backend/package*.json backend/
RUN cd backend && npm install

# Gemini reads uploaded bill files directly, so no local OCR/Python runtime is needed.
# Copy the application code.
COPY backend/ backend/

WORKDIR /app/backend
EXPOSE 5000
CMD ["node", "server.js"]
