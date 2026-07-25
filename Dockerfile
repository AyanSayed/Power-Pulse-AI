FROM node:20-bullseye

# Install Python + pip
RUN apt-get update && apt-get install -y python3 python3-pip && \
    ln -s /usr/bin/python3 /usr/bin/python

WORKDIR /app

# Copy backend and install Node deps
COPY backend/package*.json backend/
RUN cd backend && npm install

# Copy ai folder and install Python deps
COPY ai/requirements.txt ai/
RUN pip3 install -r ai/requirements.txt --break-system-packages

# Copy the rest of both folders
COPY backend/ backend/
COPY ai/ ai/

WORKDIR /app/backend
EXPOSE 5000
CMD ["node", "server.js"]