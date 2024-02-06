FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json ./
COPY yarn.lock ./

RUN yarn

# Bundle app source
COPY . .
RUN cd client && yarn install --production && yarn build

EXPOSE 8000

CMD ["node", "server.js"]