FROM python:3.6.10

RUN pip install dash
RUN pip install turicreate
RUN pip install pymongo
RUN pip install python-decouple

## WAIT FOR MONGO TO BE READY
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.7.3/wait /wait
RUN chmod +x /wait

USER root
WORKDIR /app
ADD . /app

CMD [ "sh", "-c", "/wait && python3 app.py" ]