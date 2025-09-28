FROM apify/actor-node-playwright-chrome:20

WORKDIR /usr/src/app

# install deps as root
COPY package*.json ./
RUN npm install --omit=dev

# copy source
COPY . .

# run the actor as non-root
USER myuser

CMD ["node", "main.js"]
