import argparse
import random
import numpy as np
import datetime
import math

from twisted.internet import reactor, protocol
from scipy.spatial.distance import euclidean

from client import Client, ClientFactory


class Player(Client):
  def __init__(self, name, numMoves):
    Client.__init__(self, name)
    self.grid = [[0.0] * 1000 for _ in xrange(1000)]
    self.oppMoves = []
    self.myMoves = []

  def dataReceived(self, data):
    print 'Player {0} Received: {1}'.format(self.name, data)
    line = data.strip()
    items = line.split('\n')
    if items[-1] == 'TEAM':
      self.transport.write(self.name)
      return
    if items[-1] == 'END':
      return

    assert items[-1] == 'MOVE'

    if len(items) == 1:
      self.writeMove((500, 500))

    for item in items[:-1]:
      parts = item.split()
      _, x, y = parts[0], int(parts[1]), int(parts[2])
      self.oppMoves.append((x, y))
    move = self.make_random_move()
    self.writeMove(move)

  def addOppMoves(self, move):
    for i in xrange(1000):
      for j in xrange(1000):
        self.grid[i][j] -= 1 / (euclidean((i, j), move) ** 2.0)
    self.oppMoves.append(move)

  def writeMove(self, move):
    for i in xrange(1000):
      for j in xrange(1000):
        self.grid[i][j] += 1/ (euclidean((i, j), move) ** 2.0)
    self.myMoves.append(move)
    self.transport.write('{0} {1}'.format(move[0], move[1]))

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
