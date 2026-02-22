# Use the official Bun image with Debian Linux
# Oven is the company name, the creator of Bun
FROM node:alpine

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy app files
COPY . .

# Install app dependencies
RUN pnpm install

# Run the application
CMD ["pnpm", "start"]