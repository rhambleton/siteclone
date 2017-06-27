#!/bin/bash

content=$(curl -s -G -A "Mozilla/5.0 (X11; CrOS x86_64 8172.45.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.64 Safari/537.36" "https://www.google.com/search?q=inurl:blogspot+$1")

results=($(echo $content | 
grep -Eoi '<a [^>]+>' | 
grep -Eo 'href="[^\"]+"' | 
grep -Eo '(http|https)://[^/"]+' |
grep 'blogspot.com'))

selectedresult=${results[$RANDOM % ${#results[@]} ]}

echo -n "$selectedresult" > sourceHost.dat