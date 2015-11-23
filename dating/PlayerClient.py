import sys, os, re
import signal
import random
import argparse
from twisted.internet import reactor, protocol
import numpy as np
from sklearn import preprocessing
from sklearn.decomposition import PCA

class Client(protocol.Protocol):
  """Random Client"""
  def __init__(self, N):
    self.N = int(N)

  def dataReceived(self, data):
    print "data\n", data, "\n------------------------\n"
    

  def connectionMade(self):
    #TODO: Give init w
    pass

  def connectionLost(self, reason):
    reactor.stop()

class ClientFactory(protocol.ClientFactory):
  """ClientFactory"""
  def __init__(self, N):
    self.N = N

  def buildProtocol(self, addr):
    c = Client(self.N)
    c.addr = addr
    return c

  def clientConnectionFailed(self, connector, reason):
    print "Connection failed - goodbye!"
    reactor.stop()

  def clientConnectionLost(self, connector, reason):
    print "Connection lost - goodbye!"

def main():
  parser = argparse.ArgumentParser()
  parser.add_argument("N", help="N elements")
  parser.add_argument("-p", "--port", type=int, default="6969", help="Server port to connect to.")
  args = parser.parse_args()
  N = args.N
  port = args.port
  factory = ClientFactory(N)
  reactor.connectTCP("localhost", port, factory)
  reactor.run()

if __name__ == '__main__':
    main()
