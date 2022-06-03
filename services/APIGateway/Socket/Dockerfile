FROM node:18-alpine

WORKDIR /usr/src/app

# ENV NODE_ENV=development

COPY .npmrc ./

COPY package*.json ./

RUN npm ci

COPY . .

CMD npm run start