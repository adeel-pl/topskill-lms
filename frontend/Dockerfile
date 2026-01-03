FROM node:20-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy project
COPY . .

# Create .env.local if it doesn't exist
RUN if [ ! -f .env.local ]; then echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local; fi

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev"]
