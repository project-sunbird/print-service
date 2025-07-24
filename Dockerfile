FROM node:22.15-slim as build
LABEL maintainer="Mahesh Kumar Gangula <mahesh@ilimi.in>"
USER root
COPY src /opt/print-service/
WORKDIR /opt/print-service/
#ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
RUN npm install --unsafe-perm
FROM node:22.15-slim
LABEL maintainer="Mahesh Kumar Gangula <mahesh@ilimi.in>"
RUN apt-get update \
  && apt-get install -y wget gnupg2 fonts-indic \
  && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub \
  | gpg --dearmor -o /usr/share/keyrings/google-linux-signing-keyring.gpg \
  && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-linux-signing-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" \
> /etc/apt/sources.list.d/google-chrome.list \
  && apt-get update \
  && apt-get install -y google-chrome-unstable --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*
RUN groupadd -r sunbird && useradd -r -g sunbird -G audio,video sunbird \
  && mkdir -p /home/sunbird/Downloads \
  && chown -R sunbird:sunbird /home/sunbird
RUN fc-cache -f -v
USER sunbird
COPY --from=build --chown=sunbird /opt/print-service/ /home/sunbird/print-service/
WORKDIR /home/sunbird/print-service/
# All the downloaded zip will be present inside certs folder.
RUN mkdir /home/sunbird/print-service/certs
ENV  NODE_ENV production
CMD ["node","app.js","&"]
