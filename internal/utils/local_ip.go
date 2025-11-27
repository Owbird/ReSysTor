package utils

import (
	"net"
)

func GetLocalIp() (string, error) {
	addrs, err := net.InterfaceAddrs()
	if err != nil {
		return "0.0.0.0", err
	}

	for _, addr := range addrs {
		ip, ok := addr.(*net.IPNet)
		if ok && !ip.IP.IsLoopback() {
			if ip.IP.To4() != nil {
				return ip.IP.String(), nil
			}
		}
	}
	return "0.0.0.0", nil
}
