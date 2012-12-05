#!/bin/sh
ls *.lua | xargs -l -I{} luajit -b {} {}x
