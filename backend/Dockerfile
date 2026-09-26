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

# Define the command to run the app.
# The two `migrate resolve --applied` calls permanently skip
# 20260705000000_add_trading_bots and 20260706000000_fix_trading_bots: they
# create tables for a TradingBot/BotTrade feature that no longer exists in
# schema.prisma, and their FK column (UUID) doesn't match users.id (TEXT) —
# running them for real fails on any database, fresh or not. Marking them
# applied-without-running is intentional (see render.yaml for the same
# pattern, proven working against a fresh database).
CMD ["sh", "-c", "npx prisma migrate resolve --applied 20260705000000_add_trading_bots 2>/dev/null; npx prisma migrate resolve --applied 20260706000000_fix_trading_bots 2>/dev/null; npm run migrate:deploy && npm run db:seed && npm run start"]
