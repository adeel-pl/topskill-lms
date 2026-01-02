FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project
COPY . .

# Create .env.local
RUN echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev"]
