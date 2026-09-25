# Mobile apps are built via Expo EAS Build, not Docker.
# This Dockerfile is for running the Expo development server in CI/CD.
FROM node:20-alpine
WORKDIR /app

RUN npm install -g expo-cli @expo/cli eas-cli

COPY package.json ./
RUN npm install

COPY . .

EXPOSE 8081 19000 19001 19002

# For local dev: docker run -p 8081:8081 -p 19000:19000 capa-mobile
CMD ["npx", "expo", "start", "--tunnel"]
