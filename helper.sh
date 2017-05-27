#!/bin/bash

docker stop $(docker ps -a -q)
docker build -t vlados .
docker run -p 5000:5000 --name $1 -t vlados
