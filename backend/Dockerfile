FROM node:20-alpine

WORKDIR /app

# Install openssl for Prisma, netcat for DB polling, dos2unix to guarantee LF line endings
RUN apk add --no-cache openssl netcat-openbsd dos2unix

COPY package*.json ./

RUN npm install

COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

COPY . .

# Ensure UNIX line endings and executable permissions for entrypoint script
RUN dos2unix docker-entrypoint.sh && chmod +x docker-entrypoint.sh

EXPOSE 5000

ENTRYPOINT ["./docker-entrypoint.sh"]
