package main

import (
	"errors"
	"fmt"
	"github.com/golang/protobuf/proto"
	"golang.org/x/net/context"
	"gopkg.in/readline.v1"
	"ng_rpc"
	"strings"
	"time"
)

type StatusCmdlet struct {
	instance *ConsoleInstance
}

func (c *StatusCmdlet) ExecuteCommand(tokens []string) error {
	if len(tokens) >= 2 && strings.TrimSpace(tokens[2]) != "" {
		return errors.New("Status command has no arguments")
	}
	req := &ng_rpc.StatusRequest{
		Time: proto.Int64(time.Now().Unix()),
	}
	c.instance.rl.Terminal.Print("Getting server status... \n\n")
	resp, err := c.instance.client.GetStatus(context.Background(), req)
	if err != nil {
		return err
	}
	c.instance.rl.Terminal.Print("Server status: \n")
	status_str := fmt.Sprintf(" Nodes: %d\n Links: %d\n Metrics: %d\n", resp.GetNNodes(), resp.GetNLinks(), resp.GetNMetrics())
	c.instance.rl.Terminal.Print(status_str)
	return nil
}

func (c *StatusCmdlet) GetAutocomplete() []*readline.PrefixCompleter {
	return []*readline.PrefixCompleter{
		readline.PcItem("status"),
	}
}

func (c *StatusCmdlet) GetCommandPrefix() string {
	return "status"
}

func (c *StatusCmdlet) RequiresConnection() bool {
	return true
}

func (c *StatusCmdlet) SetConsoleInstance(instance *ConsoleInstance) {
	c.instance = instance
}
