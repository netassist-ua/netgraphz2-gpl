package main

import (
	"errors"
	"google.golang.org/grpc"
	"gopkg.in/readline.v1"
	"ng_rpc"
	"regexp"
	"time"
)

var short_option_regexp *regexp.Regexp

func init() {
	short_option_regexp = regexp.MustCompile(`(([A-z0-9\.]+)( *?= *?)?([\w&.\-]+|\".*?\")? *?)`)
}

type (
	ConsoleInstance struct {
		connection *grpc.ClientConn
		client     ng_rpc.BackendClient
		rl         *readline.Instance
	}

	Cmdlet interface {
		ExecuteCommand(tokens []string) error
		GetAutocomplete() []*readline.PrefixCompleter
		GetCommandPrefix() string
		SetConsoleInstance(instance *ConsoleInstance)
	}
)

func ParseEqOptions(option_str string) (map[string]string, error) {
	options := make(map[string]string)
	submatches := short_option_regexp.FindAllStringSubmatch(option_str, -1)
	for _, submatch := range submatches {
		switch len(submatch) {
		case 4:
			options[submatch[1]] = submatch[3]
		case 2:
			options[submatch[1]] = "true"
		default:
			return options, errors.New("Failed to parse options")
		}
	}
	return options, nil
}

func (c *ConsoleInstance) Connect(host_port string) error {
	var err error
	var opts []grpc.DialOption
	opts = append(opts, grpc.WithInsecure(), grpc.WithBlock(), grpc.WithTimeout(5*time.Second))
	c.connection, err = grpc.Dial(host_port, opts...)
	if err != nil {
		c.connection = nil
		c.client = nil
		return err
	}
	c.client = ng_rpc.NewBackendClient(c.connection)
	return nil
}

func (c *ConsoleInstance) Disconnect() {
	if c.connection != nil {
		c.connection.Close()
	}
}

func get_cmdlets() []Cmdlet {
	cmdlets := []Cmdlet{}
	cmdlets = append(cmdlets, &QuitCmdlet{}, &ConnectCmdlet{}, &ListCmdlet{}, &StatusCmdlet{})
	return cmdlets
}
