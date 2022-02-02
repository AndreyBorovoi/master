FROM python:3.10-alpine

ARG PORT=5000
ARG ENV=docker
COPY . .

RUN pip install -r requirements.txt

RUN pip install gunicorn

ENV PORT ${PORT}

CMD ["gunicorn", "-b", "0.0.0.0:5000", "-w", "1", "server:app"]