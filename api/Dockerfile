FROM node:22-slim

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

RUN npm run build

EXPOSE 8080

CMD ["/wait-for-it.sh", "mysql:3306", "--", "node", "dist/server.js"]
