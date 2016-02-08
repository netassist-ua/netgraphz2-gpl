package main

import (
	"fmt"
	"gopkg.in/readline.v1"
	"strings"
)

func main() {
	fmt.Println("NetGraphz2 shell")
	fmt.Println("NetAssist LLC, 2016")
	fmt.Println("Artyom Arnautov, Philippe Duke")
	fmt.Println("")
	fmt.Println("Loading shell...")
	config := &readline.Config{
		Prompt:      "NetGraphz2 > ",
		HistoryFile: "~/.ng_history",
		EOFPrompt:   "quit",
	}

	cmdlets := get_cmdlets()

	var completer = readline.NewPrefixCompleter()
	for _, cmdlet := range cmdlets {
		completer.Children = append(completer.Children, cmdlet.GetAutocomplete()...)
	}
	config.AutoComplete = completer
	rl, err := readline.NewEx(config)

	instance := &ConsoleInstance{
		rl: rl,
	}
	for _, cmdlet := range cmdlets {
		cmdlet.SetConsoleInstance(instance)
	}

	if err != nil {
		panic(err)
	}
	defer rl.Close()

	for {
		line, err := rl.Readline()
		if err != nil { // io.EOF
			break
		}
		found := false
		tokens := strings.Split(line, " ")
		for _, cmdlet := range cmdlets {
			if tokens[0] == cmdlet.GetCommandPrefix() {
				found = true
				if cmdlet.RequiresConnection() && instance.connection == nil {
					rl.Terminal.Print("Command requires established server connection.\n")
					rl.Terminal.Print("Use 'connect' command first to establish connection.\n")
					break
				}
				err = cmdlet.ExecuteCommand(tokens)
				if err != nil {
					rl.Terminal.Print(fmt.Sprintf("Error: %v\n", err))
				}
				break
			}
		}
		if !found {
			rl.Terminal.Print("Unknown command!\n")
		}
	}
}
