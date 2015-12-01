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

def getSlope(a, b):
  return float(b[1] - a[1]) / (b[0] - a[0])

def getPoint(slope, mid):
  points = []

  for scaler in (100, 200, 300):
    x = ((scaler ** 2) / float(1 + (slope ** 2))) ** 0.5
    y = slope * x
    points.append((int(mid[0] + x), int(mid[1] + y)))
    points.append((int(mid[0] - x), int(mid[1] - y)))

  return points

  #x = (10000 / float(1 + (slope ** 2))) ** 0.5
  #y = slope * x
  #return (int(mid[0] + x), int(mid[1] + y)), (int(mid[0] - x), int(mid[1] - y))

class Player(Client):
  def __init__(self, name, numMoves):
    Client.__init__(self, name)
    self.numMoves = numMoves
    genVoronoi.init_cache()
    self.points = np.zeros([2, numMoves, 2], dtype=np.int)
    self.points.fill(-1)
    self.colors = np.zeros([2, 3], dtype=np.uint8) #Dummy data to run score script
    self.myMoves = set([])
    self.oppMoves = set([])
    self.myIdx = 1
    self.oppIdx = 0
    self.myCnt = 0
    self.oppCnt = 0

  def valid_move(self, move):
    return (0 <= move[0] < 1000 and 0 <= move[1] < 1000) and (not move in self.myMoves) and (not move in self.oppMoves)

  def make_first_move(self):
    ret = (500, 500)
    maxScore = self.probe_score(ret[0], ret[1])

    for pad_x in (-200, -100, 0, 100, 200):
      for pad_y in (-200, -100, 0, 100, 200):
        now = (500 + pad_x, 500 + pad_y)
        if self.valid_move(now):
          score = self.probe_score(now[0], now[1])
          if score > maxScore:
            ret = now
            score = maxScore

    return ret

  def make_second_move(self):
    x, y = list(self.myMoves)[0]

    ret = (x, y)
    maxScore = 0

    for add_x in (-300, -200, -100, 100, 200, 300):
      for add_y in (-300, -200, -100, 100, 200, 300):
        move = (x + add_x, y + add_y)
        if self.valid_move(move):
          score = self.probe_score(move[0], move[1])
          if score > maxScore:
            ret = move
            maxScore = score

    return ret

  def make_move(self):
    if len(self.myMoves) == 0:
      return self.make_first_move()
    if len(self.myMoves) == 1:
      return self.make_second_move()

    ret = (0, 0)
    maxScore = 0
    myMoves = list(self.myMoves)

    for i in xrange(len(myMoves)-1):
      for j in xrange(i+1, len(myMoves)):
        a, b = myMoves[i], myMoves[j]
        slope = -1 * getSlope(a, b)
        mid = ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2)
        points = getPoint(slope, mid)

        for t in points:
          if not self.valid_move(t):
            for pad_x in (-10, 10):
              for pad_y in (-10, 10):
                if self.valid_move((t[0] + pad_x, t[1] + pad_y)):
                  score = self.probe_score(t[0] + pad_x, t[1] + pad_y)
                  if score > maxScore:
                    ret = (t[0] + pad_x, t[1] + pad_y)
                    maxScore = score
            continue
            
          score = self.probe_score(t[0], t[1])
          if score > maxScore:
            ret = t
            maxScore = score

    #TODO: Use some random approach to prevent clustering

    return ret

  def dataReceived(self, data):
    print 'Player {0} Received: {1}'.format(self.name, data)
    print 'Round:', self.myCnt + 1
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
      self.oppMoves.add((x, y))
      self.oppCnt += 1

    x, y = self.make_move()
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

    return scores[0]

  def updatePoints(self, player, move, x, y):
    self.points[player][move][0] = x
    self.points[player][move][1] = y
    genVoronoi.generate_voronoi_diagram(2, self.numMoves, self.points, self.colors, None, 0, 0)

  def decide(self, x, y):
    self.updatePoints(self.myIdx, self.myCnt, x, y)
    self.myCnt += 1
    self.myMoves.add((x, y))
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
