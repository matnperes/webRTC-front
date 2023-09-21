FROM node:16

WORKDIR /app

COPY package*.json ./

## Install dependencies
RUN npm i 

## Add source code
COPY . .

EXPOSE 3000

CMD ["npm", "start"]
