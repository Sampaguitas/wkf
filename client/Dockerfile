# base image
FROM node:14.4.0

# path to working directory
WORKDIR /app

# copy package.json into our working directory
COPY package.json .
COPY package-lock.json .

# run npm install
RUN npm install

# add our source code into the image
COPY . .

EXPOSE 3000

# command to start the app
CMD ["npm", "run", "start"]