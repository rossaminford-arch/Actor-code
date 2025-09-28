FROM apify/actor-node-playwright-chrome:20

# App directory and permissions
WORKDIR /usr/src/app
RUN mkdir -p /usr/src/app && chown -R myuser:myuser /usr/src/app

# Switch to non-root user *after* chown
USER myuser

# Install deps
COPY --chown=myuser:myuser package*.json ./
RUN npm install --omit=dev

# Copy the rest
COPY --chown=myuser:myuser . .

CMD ["node", "main.js"]
