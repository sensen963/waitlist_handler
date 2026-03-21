FROM node:21-slim

WORKDIR /app

COPY package.json yarn.lock* ./

RUN yarn install --ignore-engines

COPY . .

RUN npx prisma generate

RUN npm run build

EXPOSE 3001

CMD npx prisma db push && npm start
