# Download Node.js
FROM node:9.3

# Create directories
RUN mkdir /var/app

# Set working directory
WORKDIR /var/app

# Application ports
EXPOSE 9000

# Copy package.json files
COPY package.json /var/app/package.json
COPY package-lock.json /var/app/package-lock.json

# Install packages
RUN npm install

# Set volume path
VOLUME /var/app