FROM apify/actor-node-playwright-chrome:20

WORKDIR /usr/src/app

# Use the non-root user for installing deps and running the actor
USER myuser

COPY --chown=myuser:myuser package*.json ./
# If there’s no lockfile, npm ci will fail; fall back to npm install
RUN npm ci --omit=dev || npm install --omit=dev

COPY --chown=myuser:myuser . ./

CMD ["node", "main.js"]
