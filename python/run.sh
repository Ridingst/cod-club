#!/bin/sh  
while $RUN_SCRAPER
do
  echo "Running API query"
  python3 get_all_data.py --log=INFO
  sleep 1h
done
