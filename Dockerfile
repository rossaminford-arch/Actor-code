FROM apify/actor-node-playwright-chrome:20

WORKDIR /usr/src/app
USER myuser

# Copy only manifests first
COPY --chown=myuser:myuser package*.json ./

# No lockfile? then just install
RUN npm install --omit=dev

# Copy the rest and run
COPY --chown=myuser:myuser . ./
CMD ["node", "main.js"]
