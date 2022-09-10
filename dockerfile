FROM node:12

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
RUN update-alternatives --install /usr/bin/python python /usr/bin/python3 10
COPY . .
EXPOSE 8080
CMD [ "node", "app.js" ]
