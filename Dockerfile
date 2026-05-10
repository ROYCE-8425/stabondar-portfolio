# Use official lightweight Node.js image
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of the application files
COPY . .

# Ensure the database file and uploaded images persist
# We will map these in docker-compose, but we can touch the db file just in case
RUN touch database.json && chmod 666 database.json

# Expose the application port
EXPOSE 8000

# Start the Node.js server
CMD ["node", "server.js"]
