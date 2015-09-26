#include <iostream>
#include <vector>
#include <string>
#include <map>
#include <set>
#include <math.h>
#include <pthread.h>
#include <stdlib.h>
#include <time.h>
#include <limits.h>
#include <stdio.h>

using namespace std;

struct node {
  int x;
  int y;
  int z;
  int group;

  bool operator==(const node &a)const {
    return a.x == x && a.y == y && a.z == z;
  }

  node(int a, int b, int c): x(a), y(b), z(c), group(-1) {};
};

struct cluster {
  node *centroid;
  vector<node*> nodes;

  cluster(node *c): centroid(c) {};
};

set<int> generateRand(int num) {
  set<int> ret;
  srand(time(NULL));

  while (ret.size() < num) {
    int a = (rand() % 1000) + 1;
    ret.insert(a);
  }

  return ret;
}

node *getCentroid(cluster c) {
  int xSum = 0, ySum = 0, zSum = 0;
  for (vector<node*>::iterator it = c.nodes.begin(); it != c.nodes.end(); it++) {
    xSum += (*it)->x;
    ySum += (*it)->y;
    zSum += (*it)->z;
  }

  return new node(xSum / c.nodes.size(), ySum / c.nodes.size(), zSum / c.nodes.size());
}

int dist(node *a, node *b) {
  return round(sqrt(pow(a->x - b->x, 2) + pow(a->y - b->y, 2) + pow(a->z - b->z, 2)));
}

void runKMeans(map<int, cluster*> &groups, map<int, node*> &grid) {
  //Grouping
  for (map<int, node*>::iterator gridIter = grid.begin(); gridIter != grid.end(); gridIter++) {
    node *now = gridIter->second;
    int minDist = INT_MAX;
    for (map<int, cluster*>::iterator clusterIter = groups.begin(); clusterIter != groups.end(); clusterIter++) {
      if (dist(now, clusterIter->second->centroid) < minDist) {
        minDist = dist(now, clusterIter->second->centroid);
        now->group = clusterIter->first;
      }
    }
    groups[now->group]->nodes.push_back(now);
  }

  //Compute new centroids
  bool hasUpdated = false;
  for (map<int, cluster*>::iterator it = groups.begin(); it != groups.end(); it++) {
    node *newCentroid = getCentroid(*(it->second));
    if (!(*(it->second->centroid) == *newCentroid)) {
      hasUpdated = true;
      delete it->second;
      it->second = new cluster(newCentroid);
    }
  }

  //Check ending condition
  if (hasUpdated) {
    runKMeans(groups, grid);
  }
}

int main(int argc, char **argv) {

  string inputLine;
  map<int, node*> grid;
  while (getline(cin, inputLine)) {
    int name, x, y, z;
    sscanf(inputLine.c_str(), "%d %d %d %d", &name, &x, &y, &z);
    grid[name] = new node(x, y, z);
  }

  //Step 1: Node clustering
  int K = int(ceil(sqrt(grid.size() / 2.f)));
  set<int> init = generateRand(K);
  map<int, cluster*> groups;
  int count = 0;
  for (set<int>::iterator it = init.begin(); it != init.end(); it++) {
    groups[count++] = new cluster(new node(grid[*it]->x, grid[*it]->y, grid[*it]->z));
  }
  runKMeans(groups, grid);
  
  //Step 2: cluster optimal path finding
  //Step 3: Cluster connection

  return 0;
}
