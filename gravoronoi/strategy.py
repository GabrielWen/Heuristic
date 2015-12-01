import argparse
import random
import numpy as np
import datetime
import math

from twisted.internet import reactor, protocol
from scipy.spatial.distance import euclidean

from client import Client, ClientFactory
import genVoronoi

import sys, time

class Player(Client):
  def __init__(self, name, numMoves):
    Client.__init__(self, name)
    self.numMoves = numMoves
    genVoronoi.init_cache()
    self.points = np.zeros([2, numMoves, 2], dtype=np.int)
    self.points.fill(-1)
    self.colors = np.zeros([2, 3], dtype=np.uint8) #Dummy data to run score script
    self.myMoves = []
    self.myIdx = 1
    self.oppIdx = 0
    self.myCnt = 0
    self.oppCnt = 0
 

  def make_move(self):
    read = sys.stdin.readline()
    parts = read.split()
    x, y = int(parts[0]), int(parts[1])
    return (x, y)

  def dataReceived(self, data):
    print 'Player {0} Received: {1}'.format(self.name, data)
    line = data.strip()
    items = line.split('\n')
    if items[-1] == 'TEAM':
      self.transport.write(self.name)
      return
    if items[-1] == 'END':
      self.transport.loseConnection()

    assert items[-1] == 'MOVE'

    if len(items) == 1:
      self.myIdx = 0
      self.oppIdx = 1
      self.decide(500, 500)
      return

    for item in items[:-1]:
      parts = item.split()
      x, y = int(parts[1]), int(parts[2])
      self.updatePoints(self.oppIdx, self.oppCnt, x, y)
      self.oppCnt += 1

    read = sys.stdin.readline().split()
    x, y = int(read[0]), int(read[1])
    self.decide(x, y)

  def get_score(self):
    scores = genVoronoi.get_scores(2)
    return scores[self.myIdx], scores[self.oppIdx]

  def probe_score(self, x, y):
    self.points[self.myIdx][self.myCnt][0] = x
    self.points[self.myIdx][self.myCnt][1] = y
    genVoronoi.generate_voronoi_diagram(2, self.numMoves, self.points, self.colors, None, 0, 0)
    scores = self.get_score()

    #undo
    self.points[self.myIdx][self.myCnt][0] = -1
    self.points[self.myIdx][self.myCnt][1] = -1
    genVoronoi.generate_voronoi_diagram(2, self.numMoves, self.points, self.colors, None, 0, 0)

    return scores

  def updatePoints(self, player, move, x, y):
    self.points[player][move][0] = x
    self.points[player][move][1] = y
    genVoronoi.generate_voronoi_diagram(2, self.numMoves, self.points, self.colors, None, 0, 0)

  def decide(self, x, y):
    self.updatePoints(self.myIdx, self.myCnt, x, y)
    self.myCnt += 1
    self.myMoves.append((x, y))
    self.transport.write('{0} {1}'.format(x, y))

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
