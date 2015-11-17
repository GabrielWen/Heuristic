import sys
import random
import time
import argparse

from twisted.internet import reactor, protocol

board_size = 1000

direction = {
  'LEFT': (-1, 0),
  'RIGHT': (1, 0),
  'TOP': (0, 1),
  'DOWN': (0, -1)
}

class Node(object):
  def __init__(self, id, x, y):
    self.label = id
    self.pos = (x, y)
    self.neighbors = {}
    self.status = True

  def addNeighbor(self, direction, neigh):
    self.neighbors[direction] = neigh

  def hasNeighbor(self, direction):
    return self.neighbors.get(direction) is not None

  def getNeighbor(self, direction):
    return self.neighbors.get(direction)

  def setStatus(self, status):
    self.status = status

  def getStatus(self):
    return self.status

class Grid(object):
  def __init__(self):
    self.nodes = {}
    self.grid = {}

  def addNode(self, pos, node):
    self.nodes[node.label] = node
    self.grid[pos] = node

  def addEdge(self, nodeId1, nodeId2):
    node1, node2 = self.nodes[nodeId1], self.nodes[nodeId2]
    pos1, pos2 = node1.pos, node2.pos
    node1.addNeighbor((pos2[0] - pos1[0], pos2[1] - pos1[1]), node2)
    node2.addNeighbor((pos1[0] - pos2[0], pos1[1] - pos2[1]), node1)

  def getNode(self, id):
    return self.nodes[id]

class Muncher(object):
  pass

class Client(protocol.Protocol):
  """Random Client"""
  def __init__(self, name, grid):
    self.name = name
    self.prev_moves = []
    self.grid = grid

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

  def updateNode(self, data):
    pass

  def updatePlayerState(self, data):
    pass

  def makeMove(self):
    pass

  def dataReceived(self, data):
    lines = data.strip().split('\n')
    for l in lines:
      if l in ('START', '', 'END'):
        continue

      if l.find('nodeid') != -1 or l.find('PlayerID') != -1:
        continue

      state = l.split(',')
      if len(state) == 8:
        self.updateNode(state)
      elif len(state) == 6:
        self.updatePlayerState(state)

  def connectionMade(self):
    self.transport.write('REGISTER: {0}\n'.format(self.name))

  def connectionLost(self, reason):
      reactor.stop()

def readGrid(grid):
  f = open('./data.in', 'r')
  while True:
    line = f.readline()
    if not line:
      break

    data = line.split(',')
    if len(data) == 2:
      # Add Edge
      try:
        grid.addEdge(int(data[0]), int(data[1]))
      except:
        pass
    elif len(data) == 3:
      # Add Node
      try:
        newNode = Node(int(data[0]), int(data[1]), int(data[2]))
        grid.addNode((int(data[1]), int(data[2])), newNode)
      except:
        pass
  f.close()

class ClientFactory(protocol.ClientFactory):
  """ClientFactory"""
  def __init__(self, name):
    self.name = name

  def buildProtocol(self, addr):
    grid = Grid()
    readGrid(grid)
    c = Client(self.name, grid)
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
