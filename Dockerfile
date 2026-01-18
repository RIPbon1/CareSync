# Dockerfile optimized for Hugging Face Spaces
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (for better caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the Next.js application
RUN npm run build

# Expose port 7860 (required by Hugging Face Spaces)
EXPOSE 7860

# Set environment variable for Next.js to use port 7860
ENV PORT=7860
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]