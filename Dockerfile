FROM python:3.10.1-slim

WORKDIR /app

COPY WEB_GAMES/ ./

RUN pip install --no-cache-dir -r requirements.txt

RUN find /app -type f -exec chmod 444 {} \; && \
    find /app -type d -exec chmod 555 {} \; && \
    chmod 644 /app/app.db

RUN echo "#!/bin/bash\ncp /app/app.db.original /app/app.db\npython main.py" > /entrypoint.sh && \
    chmod +x /entrypoint.sh

RUN cp /app/app.db /app/app.db.original && \
    chmod 444 /app/app.db.original

CMD ["/entrypoint.sh"]