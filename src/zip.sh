#!/bin/bash
rm -rf ./arch.zip
zip -r arch.zip . -x ".git*" ".DS_Store" "*old/*" "*images/*"
