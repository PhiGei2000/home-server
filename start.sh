#!/bin/bash

npm run build

pm2 start npm --name home-server -- run start 
