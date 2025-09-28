# syntax=docker/dockerfile:1

# Includes Playwright + Chrome and all required OS deps
FROM apify/actor-node-playwright-chrome:20

WORKDIR /usr/src/app

# Install only your npm deps; give myuser write access
COPY --chown=myuser:myuser package*.json ./
# If you have a package-lock.json, prefer: RUN npm ci --omit=dev
RUN npm install --omit=dev

# Add the rest of your code
COPY --chown=myuser:myuser . ./

# Start the actor
CMD ["npm", "start"]
