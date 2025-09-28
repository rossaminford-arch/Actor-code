FROM apify/actor-node-playwright-chrome:20

WORKDIR /usr/src/app

# Install node deps
COPY package*.json ./
RUN npm install --omit=dev

# Install Playwright browsers into /root/.cache
RUN npx --yes playwright install --with-deps chromium

# Add your code and run
COPY . .
CMD ["node", "main.js"]
