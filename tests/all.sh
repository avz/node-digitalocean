#!/bin/sh

dir=$(dirname "$0")

for js in "$dir"/*.js; do
	name=$(basename "$js")

	echo -n "$name ... "
	if ! node "$js"; then
		echo "error"
		exit 1;
	fi
	echo "done"
done
