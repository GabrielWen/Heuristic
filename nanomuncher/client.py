import sys
import random
import time
import argparse

from twisted.internet import reactor, protocol

board_size = 1000

class Client(protocol.Protocol):
    """Random Client"""
    def __init__(self, name):
        self.name = name
        self.prev_moves = []

    def reset(self):
        print "Reset called"
        self.prev_moves = []

    def make_random_move(self):
        move = None
        while not move:
            x = random.randint(0, board_size-1)
            y = random.randint(0, board_size-1)
            if (x, y) not in self.prev_moves:
                move = (x, y)
        return move

    def dataReceived(self, data):
        print "Received: %r" % data

    def connectionMade(self):
        self.transport.write('REGISTER: {0}\n'.format(self.name))

    def connectionLost(self, reason):
        reactor.stop()

class ClientFactory(protocol.ClientFactory):
    """ClientFactory"""
    def __init__(self, name):
        self.name = name

    def buildProtocol(self, addr):
        c = Client(self.name)
        c.addr = addr
        return c

    def clientConnectionFailed(self, connector, reason):
        print "Connection failed - goodbye!"
        reactor.stop()

    def clientConnectionLost(self, connector, reason):
        print "Connection lost - goodbye!"

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("name", help="Your name")
    parser.add_argument("-p", "--port", type=int, default="1377", help="Server port to connect to.")
    args = parser.parse_args()
    client_name = args.name
    port = args.port
    factory = ClientFactory(client_name)
    reactor.connectTCP("localhost", port, factory)
    reactor.run()

if __name__ == '__main__':
    main()
