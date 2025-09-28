FROM apify/actor-node-playwright-chrome:20

# app lives in myuser's home; no chown needed
WORKDIR /home/myuser/app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

USER myuser
CMD ["node", "main.js"]
