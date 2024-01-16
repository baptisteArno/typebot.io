
FROM node:20
WORKDIR /app

RUN curl -sL https://unpkg.com/@pnpm/self-installer | node