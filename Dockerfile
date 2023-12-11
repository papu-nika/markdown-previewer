FROM node:20
COPY package*.json /app/
WORKDIR /app
RUN npm install
ENV NODE_ENV=production
COPY . /app
RUN npm run build

CMD ["npm", "run", "start"]
