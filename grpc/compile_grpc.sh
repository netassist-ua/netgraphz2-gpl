#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
OLD_DIR=$DIR
source $DIR/../backend/set_env
DIR=$OLD_DIR
echo "Compiling PHP gRPC stubs..."
protoc-gen-php -i $DIR -o $DIR/php-out $DIR/ng_backend.proto
#protoc --php_out=$DIR/php-out -I $DIR $DIR/ng_backend.proto
echo "Compiling Go gRPC stubs..."
protoc --go_out=plugins=grpc:$DIR/go-out -I $DIR $DIR/ng_backend.proto

exit 0
