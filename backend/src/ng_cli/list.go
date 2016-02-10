package main

import (
	"errors"
	"fmt"
	"github.com/golang/protobuf/proto"
	"golang.org/x/net/context"
	"gopkg.in/readline.v1"
	"io"
	"ng_rpc"
	"strconv"
	"strings"
)

type ListCmdlet struct {
	instance *ConsoleInstance
}

func (c *ListCmdlet) PrintUsage() {
	c.instance.rl.Terminal.Print("usage: list object [options]\n")
	c.instance.rl.Terminal.Print("objects: metrics\n")
	c.instance.rl.Terminal.Print("options: \n")
	c.instance.rl.Terminal.Print("skip=n_skip - skip n_skip records\n")
	c.instance.rl.Terminal.Print("take=n_take - limit output to n_take records\n")
	c.instance.rl.Terminal.Print("metrics options: \n")
	c.instance.rl.Terminal.Print("host=hostname - filter by host name")
}

func (c *ListCmdlet) list_metrics(options map[string]string) error {
	var n_skip int64 = 0
	var n_take int64 = -1
	var filter_host bool = false
	var host string = ""
	for key, _ := range options {
		var err error = nil
		switch key {
		case "host":
			filter_host = true
			host = options[key]
		case "skip":
			n_skip, err = strconv.ParseInt(options[key], 10, 64)
		case "take":
			n_take, err = strconv.ParseInt(options[key], 10, 64)
		default:
			err = fmt.Errorf("Option %s is not supported. Yet?", key)
		}
		if err != nil {
			c.PrintUsage()
			return err
		}
	}
	req := &ng_rpc.AllMetricsRequest{
		NSkip:          proto.Int64(n_skip),
		NTake:          proto.Int64(n_take),
		FilterHostName: proto.Bool(filter_host),
		HostName:       proto.String(host),
	}
	stream, err := c.instance.client.GetAllMetrics(context.Background(), req)
	if err != nil {
		return err
	}
	for {
		metric, err := stream.Recv()
		if err == io.EOF {
			break
		}
		if err != nil {
			return err
		}
		c.instance.rl.Terminal.Print(fmt.Sprintf("* %v\n", metric))
	}
	return nil
}

func (c *ListCmdlet) ExecuteCommand(tokens []string) error {
	raw_options := make(map[string]string)
	var err error = nil
	if len(tokens) < 2 {
		c.PrintUsage()
		return errors.New("Arguments error")
	}
	object := tokens[1]
	if len(tokens) >= 3 {
		raw_options, err = ParseEqOptions(strings.Join(tokens[2:], " "))
		if err != nil {
			c.PrintUsage()
			return err
		}
	}
	switch object {
	case "metrics":
		return c.list_metrics(raw_options)
	default:
		return errors.New("Object is not supported")
	}

	return nil
}

func (c *ListCmdlet) GetAutocomplete() []*readline.PrefixCompleter {
	return []*readline.PrefixCompleter{
		readline.PcItem("list",
			readline.PcItem("metrics"),
		),
	}
}

func (c *ListCmdlet) GetCommandPrefix() string {
	return "list"
}

func (c *ListCmdlet) SetConsoleInstance(instance *ConsoleInstance) {
	c.instance = instance
}

func (c *ListCmdlet) RequiresConnection() bool {
	return true
}
