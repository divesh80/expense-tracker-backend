# Backend Dockerfile
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

RUN npm rebuild bcrypt --build-from-source

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Expose the backend port
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
