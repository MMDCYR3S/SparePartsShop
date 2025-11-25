FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --silent

# Copy all files
COPY . .

# Build the app
RUN npm run build

# Expose port
EXPOSE 3000 5173

# Start the app
CMD ["npm", "run", "dev", "--", "--host"]