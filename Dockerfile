# Dockerfile
FROM apify/actor-node-playwright-chrome:20
WORKDIR /usr/src/app

# install deps
COPY package.json ./
RUN npm install --omit=dev   # <-- use npm install, no lockfile needed

# if you want, you can keep this line, but on this image it's optional
# RUN npx playwright install --with-deps

# copy the rest and run
COPY . ./
CMD ["npm","start"]
