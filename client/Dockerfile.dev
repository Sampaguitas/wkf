# base image
FROM node:14.4.0-alpine

# path to working directory
WORKDIR /app

# add npm env variable
ARG NPM_TOKEN

COPY .npmrc .npmrc

# copy package.json into our working directory
COPY package.json .
COPY package-lock.json .

# run npm install
RUN npm install

# remove .npmrc file
RUN rm -f .npmrc

# add our source code into the image
COPY . .

EXPOSE 3000

# command to start the app
CMD ["npm", "run", "start"]