# Hillcroft Cod Club

## Get running locally

`docker-compose build`
`docker-compose up`

## Get running locally

SSH into the server
`git pull`
`docker-compose build`
`docker-compose up -d`

## Weird stuff
The python scraper image is used for different purposes by overwriting the Docker entry comand.
Options are;

`CMD [ "./run.sh" ]` Used by the version 1: runs on a 5 mins schedule. Drops the files to a .js file that is loaded by the html.
`CMD [ "python3", "get_all_data.py" ]` Get's all the data and loads it into mongodb. There's rate limiting and we want regularity in the data (ie not different time steps) so we don't want this to run everytime we deploy. Used as the CMD on a scheduled task.
`CMD [ "echo", "done" ]` To achieve the above point we need a nothing comand to get the container started so it doesn't run the queries.

When running locally mongoku boots up too quickly and doesn't connect. You'll need to enter the connection details in the UI. AWS has a better build scheduler that can easily avoid this problem.