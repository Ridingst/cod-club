# Hillcroft Cod Club

## Get running

`docker-compose build`
`docker-compose up`

## Deploy new version

Do the changes locall then run `docker-compose build` followed by `docker-compose push`.
You may need to log in to AWS. Check with the ECR registry for easy instructions.

## Start the cluster
`ecs-cli up --keypair RidingsPersonal --size 1 --instance-role cod-club-instance --instance-type m5a.large --spot-price 0.08 --vpc vpc-0349447b2f8569d76 --subnets subnet-0f9ae94906aadf37f,subnet-0de326328091b4ea3,subnet-0ce0db3d990db0e95,subnet-0c45498ccfc1f250c --verbose`


## Weird stuff
The python scraper image is used for different purposes by overwriting the Docker entry comand.
Options are;

`CMD [ "./run.sh" ]` Used by the version 1: runs on a 5 mins schedule. Drops the files to a .js file that is loaded by the html.
`CMD [ "python3", "get_all_data.py" ]` Get's all the data and loads it into mongodb. There's rate limiting and we want regularity in the data (ie not different time steps) so we don't want this to run everytime we deploy. Used as the CMD on a scheduled task.
`CMD [ "echo", "done" ]` To achieve the above point we need a nothing comand to get the container started so it doesn't run the queries.

When running locally mongoku boots up too quickly and doesn't connect. You'll need to enter the connection details in the UI. AWS has a better build scheduler that can easily avoid this problem.