# Etapa de construcción
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Etapa final
FROM node:20-alpine

WORKDIR /app

# Argumentos en build time
ARG NODE_ENV
ARG APP_PORT
ARG DB_HOST
ARG DB_PORT
ARG DB_USERNAME
ARG DB_PASSWORD
ARG DB_DATABASE
ARG JWT_SECRET
ARG JWT_EXPIRES_IN
ARG COGNITO_REGION
ARG COGNITO_USER_POOL_ID

# Convertirlos en variables de entorno para runtime
ENV NODE_ENV=$NODE_ENV \
    APP_PORT=$APP_PORT \
    DB_HOST=$DB_HOST \
    DB_PORT=$DB_PORT \
    DB_USERNAME=$DB_USERNAME \
    DB_PASSWORD=$DB_PASSWORD \
    DB_DATABASE=$DB_DATABASE \
    JWT_SECRET=$JWT_SECRET \
    JWT_EXPIRES_IN=$JWT_EXPIRES_IN \
    COGNITO_REGION=$COGNITO_REGION \
    COGNITO_USER_POOL_ID=$COGNITO_USER_POOL_ID

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 4000
CMD ["node", "dist/main.js"]
