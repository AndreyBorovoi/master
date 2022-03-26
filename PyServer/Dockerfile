FROM python:3.10-slim

ARG PORT=5000
ARG ENV=docker
COPY . .

RUN python3 -m pip install -r requirements.txt

RUN python3 -m pip install gunicorn

ENV PORT ${PORT}
ENV MODELID ${MODELID}

# CMD ["gunicorn", "-b", "0.0.0.0:5000", "-w", "1", "server:app"]