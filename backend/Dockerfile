FROM node:20-alpine

WORKDIR /app

# Install openssl for Prisma on Alpine
RUN apk add --no-cache openssl netcat-openbsd

COPY package*.json ./

RUN npm install

COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

COPY . .

# Copy entrypoint script and make it executable
RUN chmod +x docker-entrypoint.sh

EXPOSE 5000

ENTRYPOINT ["./docker-entrypoint.sh"]
