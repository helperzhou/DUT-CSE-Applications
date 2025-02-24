#!/bin/bash
cd /home/site/wwwroot
npm ci --legacy-peer-deps
npm run build
npm run start 