# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY yarn.lock ./

# Install dependencies
RUN yarn install

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Load Dataset stage
FROM builder AS load_dataset

RUN yarn dataset:load

RUN find . -name "*.csv" -type f -delete

# Development stage
FROM builder AS development

COPY --from=load_dataset ./database/* ./database/

CMD ["yarn", "start:dev"]

# Production stage
FROM node:22-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY yarn.lock ./

# Install production dependencies only
RUN yarn install --production; yarn cache clean

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy dataset from load_dataset stage
COPY --from=load_dataset /app/database ./database/

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["yarn", "start:prod"]