#!/bin/bash

docker rm -f $1
docker build -t vlados .
docker run -p 5000:5000 --name $1 -t vlados
