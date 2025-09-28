# Playwright-ready image (includes Chrome + deps)
FROM apify/actor-node-playwright-chrome:20

# Install deps
COPY package*.json ./
RUN npm ci --omit=dev && npx playwright install --with-deps

# Copy source and run
COPY . ./
CMD ["npm","start"]
