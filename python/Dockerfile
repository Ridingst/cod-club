FROM python:3.8

ADD cod_data_scraper.py /home
ADD get_all_data.py /home
ADD run.sh /home
WORKDIR /home

RUN mkdir /home/data/

## WAIT FOR MONGO TO BE READY
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.7.3/wait /wait
RUN chmod +x /wait

RUN pip install callofduty.py
RUN pip install python-decouple
RUN pip install pymongo

CMD [ "sh", "-c", "/wait && ./run.sh" ] # Moving away from the old 5 mins schedule
# CMD [ "python3", "get_all_data.py" ] #Instead we will use scheduled image to run every hour rather than on start-up.
# CMD [ "echo", "done" ]
