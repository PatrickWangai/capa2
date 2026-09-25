# Stage 1: Build the React application
FROM node:20-alpine as build

ARG VITE_API_URL=http://localhost:4000
ARG VITE_WS_URL=ws://localhost:4000
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WS_URL=$VITE_WS_URL

WORKDIR /app

COPY package*.json ./
RUN npm install --frozen-lockfile

COPY . .
RUN npm run build
