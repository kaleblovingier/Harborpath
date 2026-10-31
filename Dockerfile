FROM node:22-alpine

WORKDIR /app
COPY package.json server.js ./
COPY src ./src
COPY public ./public
COPY data ./data

# Set TRUST_PROXY to the number of reverse proxies in front of this container
# that append to X-Forwarded-For (1 for one load balancer). Without a proxy,
# leave it unset: trusting the header would let clients pick their own key.
ENV NODE_ENV=production \
    PORT=3000

USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1
CMD ["node", "server.js"]
