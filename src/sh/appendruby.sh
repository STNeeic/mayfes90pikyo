#!/bin/bash
mecab $1 | python3 ../py/mecab2ruby.py
