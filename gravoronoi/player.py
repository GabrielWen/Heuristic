import argparse
import random

from twisted.internet import reactor, protocol

from client import Client, ClientFactory

class Player(Client):
  def __init__(self, name, numMoves):
    Client.__init__(self, name)
    self.numMoves = numMoves

class PlayerFactory(ClientFactory):
  def __init__(self, name, numMoves):
    ClientFactory.__init__(self, name)
    self.numMoves = numMoves

  def buildProtocol(self, addr):
    c = Player(self.name, self.numMoves)
    c.addr = addr
    return c

def main():
  parser = argparse.ArgumentParser()
  parser.add_argument('name', help='Team Name')
  parser.add_argument('-p', '--port', type=int, default=1337, help='Server port')
  parser.add_argument('-m', '--numMoves', type=int, default=10, help='Number of moves available')
  args = parser.parse_args()

  name = args.name
  port = args.port
  numMoves = args.numMoves
  factory = PlayerFactory(name, numMoves)
  reactor.connectTCP('127.0.0.1', port, factory)
  reactor.run()

if __name__ == '__main__':
  main()
