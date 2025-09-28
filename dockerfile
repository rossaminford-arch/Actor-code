# Includes Playwright + Chrome + all system deps
FROM apify/actor-node-playwright-chrome:20

# Make sure the workdir exists and belongs to myuser
USER root
RUN mkdir -p /usr/src/app && chown -R myuser:myuser /usr/src/app
WORKDIR /usr/src/app

# Switch to myuser so npm writes to a writable dir
USER myuser

# Copy manifests with the right ownership (VERY important)
COPY --chown=myuser:myuser package*.json ./

# Install deps (use ci if you have a lockfile; fallback to install)
RUN npm ci --omit=dev || npm install --omit=dev

# Copy the rest of the code, also with the right ownership
COPY --chown=myuser:myuser . ./

# Start your actor
CMD ["npm", "start"]
