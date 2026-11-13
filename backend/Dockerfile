FROM node:20-alpine

WORKDIR /app

# Prefer IPv4 DNS resolution (prevents Alpine musl EAI_AGAIN timeouts in Node/npm/Prisma)
ENV NODE_OPTIONS="--dns-result-order=ipv4first"

# Install openssl & libc6-compat for Prisma, netcat for DB polling, dos2unix for LF line endings
RUN apk add --no-cache openssl libc6-compat netcat-openbsd dos2unix

COPY package*.json ./

RUN npm install --no-audit --no-fund

COPY prisma ./prisma/

# Ensure prisma CLI is present and generate Prisma Client directly via node
RUN test -f ./node_modules/prisma/build/index.js || npm install prisma@6.14.0 --no-save
RUN node ./node_modules/prisma/build/index.js generate

COPY . .

# Ensure UNIX line endings and executable permissions for entrypoint script
RUN dos2unix docker-entrypoint.sh && chmod +x docker-entrypoint.sh

EXPOSE 5000

ENTRYPOINT ["./docker-entrypoint.sh"]
