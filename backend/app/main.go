package main

import (
	_"fmt"
	_"runtime"
	"log/syslog"
	_"bytes"
	_"./livestatus"
)

func main(){
	logger,err := syslog.New(syslog.LOG_DAEMON, "NetGraphz2")
	var _ = err
	defer logger.Close()
	logger.Info("Starting backend...")

	logger.Info("Stopping backend...")
}
