#!/bin/sh
ng build
cd dist/lorawan-ws-angular
gzip *.js
gzip *.txt
