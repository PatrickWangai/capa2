# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /usr/src/app/backend

# Install Prisma CLI globally in the container for easy access
RUN npm install -g prisma

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the backend source code
COPY . .

# Generate the Prisma client
RUN npx prisma generate

# Make port 4000 available to the world outside this container
EXPOSE 4000

# Define the command to run the app
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
