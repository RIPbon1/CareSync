FROM node:18-alpine

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run next
EXPOSE 7860
ENV PORT 7860

CMD ["npm", "start"]