FROM node:20-alpine
WORKDIR /usr/src/app

# copy package files first for efficient docker layer caching
COPY package.json package-lock.json* ./

RUN npm install --production

COPY . .

EXPOSE 3000
CMD ["node", "app.js"]
