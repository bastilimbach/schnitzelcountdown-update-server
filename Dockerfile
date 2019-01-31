FROM node:10.15-stretch

ARG GITHUB_DEPLOY_KEY
RUN mkdir -p /root/.ssh && \
  chmod 0700 /root/.ssh && \
  ssh-keyscan github.com > /root/.ssh/known_hosts && \
  echo "${GITHUB_DEPLOY_KEY}" > /root/.ssh/id_rsa && \
  chmod 600 /root/.ssh/id_rsa
ENV NODE_ENV production

WORKDIR /usr/src/app
COPY ["package.json", "yarn.lock", "./"]
RUN yarn install --silent
COPY . .

EXPOSE 3000
CMD yarn start
