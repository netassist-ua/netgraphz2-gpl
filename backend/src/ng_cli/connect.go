package main

import (
	"errors"
	"fmt"
	"gopkg.in/readline.v1"
	"net"
)

type ConnectCmdlet struct {
	instance *ConsoleInstance
}

func (c *ConnectCmdlet) ExecuteCommand(tokens []string) error {
	if len(tokens) != 2 {
		c.instance.rl.Terminal.Print("usage: connect hostname:port\n")
		return errors.New("Arguments error")
	}
	_, _, err := net.SplitHostPort(tokens[1])
	if err != nil {
		c.instance.rl.Terminal.Print("usage: connect hostname:port\n")
		return errors.New("Arguments error")
	}
	c.instance.rl.Terminal.Print(fmt.Sprintf("Connecting to %s\n", tokens[1]))
	err = c.instance.Connect(tokens[1])
	if err != nil {
		c.instance.rl.Terminal.Print(fmt.Sprintf("Cannot connect: %v\n", err))
		return err
	}
	c.instance.rl.Terminal.Print("Connected successfuly!\n")
	return nil
}

func (c *ConnectCmdlet) GetAutocomplete() []*readline.PrefixCompleter {
	return []*readline.PrefixCompleter{
		readline.PcItem("connect"),
	}
}

func (c *ConnectCmdlet) GetCommandPrefix() string {
	return "connect"
}

func (c *ConnectCmdlet) SetConsoleInstance(instance *ConsoleInstance) {
	c.instance = instance
}
