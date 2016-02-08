package main

import (
	"errors"
	"gopkg.in/readline.v1"
	"os"
)

type QuitCmdlet struct {
}

func (q *QuitCmdlet) ExecuteCommand(tokens []string) error {
	if len(tokens) == 0 {
		return errors.New("No tokens")
	}
	os.Exit(0)
	return nil
}

func (q *QuitCmdlet) GetAutocomplete() []*readline.PrefixCompleter {
	return []*readline.PrefixCompleter{
		readline.PcItem("quit"),
	}
}

func (q *QuitCmdlet) GetCommandPrefix() string {
	return "quit"
}

func (q *QuitCmdlet) SetConsoleInstance(instance *ConsoleInstance) {
}

func (q *QuitCmdlet) RequiresConnection() bool {
	return false
}
