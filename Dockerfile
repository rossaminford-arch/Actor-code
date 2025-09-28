# Dockerfile
FROM apify/actor-node-playwright-chrome:20

WORKDIR /usr/src/app

# Copy manifests with correct ownership
COPY --chown=myuser:myuser package.json ./
# If you have a lockfile, include it too:
# COPY --chown=myuser:myuser package-lock.json ./

# Install deps as myuser (default user in this image)
USER myuser
RUN npm install --omit=dev

# Copy the rest of your code with correct ownership
COPY --chown=myuser:myuser . ./

# Browsers are already included in this image, no need for playwright install
CMD ["npm","start"]
