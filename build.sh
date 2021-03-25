#!/usr/bin/sh
#build a jar package
npm run build
rm -rf ./build/src
mkdir -p ./build/src/main/resources
mv ./dist ./build/src/main
mv ./build/src/main/dist ./build/src/main/resources
cd ./build
mvn clean package
