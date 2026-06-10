# Multi-stage build: compile the static site, then serve it with nginx.
# Suitable for the EMBL Kubernetes / self-hosted deployment.
#
#   docker build -t dsc-concierge .
#   docker run --rm -p 8080:80 dsc-concierge   # → http://localhost:8080

FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
