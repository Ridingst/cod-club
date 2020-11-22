FROM node:10

# Create app directory
WORKDIR /usr/src/app

# Install dev tools
# FIXME: We should split this out into a dev and prod image but for now this will do.
RUN npm i -g nodemon

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# If you are building your code for production
RUN npm i

# Bundle app source
COPY . .

EXPOSE 80
CMD [ "node", "index.js" ]