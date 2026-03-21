# Build stage
FROM node:21-slim as build

WORKDIR /app

COPY package.json yarn.lock* ./

RUN yarn install --ignore-engines

COPY . .

RUN npm run build

# Production stage
FROM nginx:stable-alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
