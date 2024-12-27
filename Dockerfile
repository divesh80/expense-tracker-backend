FROM node:22

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies in the container
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Expose the backend port
EXPOSE 3001

# Start the server
CMD ["npm", "start"]
