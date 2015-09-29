#include <iostream>
#include <vector>
#include <string>
#include <map>
#include <set>
#include <queue>
#include <utility>
#include <algorithm>
#include <math.h>
#include <cmath>
#include <pthread.h>
#include <stdlib.h>
#include <time.h>
#include <limits.h>
#include <cfloat>
#include <stdio.h>

#include <time.h>
#include <assert.h>

using namespace std;

const int numAnts = 300;
const float alpha = 0.1;
const float beta = 9.f;
const float initPhe = 1.f;
const float Q = 1e-4;
const float P = 0.8;

struct node {
  int name;
  float x;
  float y;
  float z;
  float group;
  struct node *next;
  struct node *prev;

  bool operator==(const node &a)const {
    return abs(a.x - x) < 0.00001 && abs(a.y - y) < 0.00001 && abs(a.z - z) < 0.00001;
  }

  node(int n, float a, float b, float c): name(n), x(a), y(b), z(c), group(-1) {};
};

struct cluster {
  node *centroid;
  vector<node*> nodes;
  int name;
  struct cluster *prev;
  struct cluster *next;
  struct node *start; //The node connecting to previous cluster, must be the start of routing
  struct node *end; //The node connecting to next cluster, must be the end of routing

  cluster(int n, node *c): name(n), centroid(c) {};
};


// -----------  K-Means  -----------------
vector<int> generateRand(int num, size_t size) {
  vector<int> ret;
  set<int> unique;

  while (ret.size() < num) {
    int a = (rand() % size) + 1;
    if (!unique.count(a)) {
      ret.push_back(a);
      unique.insert(a);
    }
  }

  return ret;
}

node *getCentroid(cluster *c) {
  float xSum = 0.f, ySum = 0.f, zSum = 0.f;
  for (vector<node*>::iterator it = c->nodes.begin(); it != c->nodes.end(); it++) {
    xSum += (*it)->x;
    ySum += (*it)->y;
    zSum += (*it)->z;
  }

  return new node(c->name, xSum / c->nodes.size(), ySum / c->nodes.size(), zSum / c->nodes.size());
}

float dist(node *a, node *b) {
  return sqrt(pow(a->x - b->x, 2) + pow(a->y - b->y, 2) + pow(a->z - b->z, 2));
}

void runKMeans(map<int, cluster*> &groups, map<int, node*> &grid) {
  //Initialize groups
  for (map<int, cluster*>::iterator it = groups.begin(); it != groups.end(); it++) {
    cluster *prev = it->second;
    it->second = new cluster(prev->name, prev->centroid);
    delete prev;
  }

  //Grouping
  for (map<int, node*>::iterator gridIter = grid.begin(); gridIter != grid.end(); gridIter++) {
    node *now = gridIter->second;
    float minDist = FLT_MAX;
    for (map<int, cluster*>::iterator clusterIter = groups.begin(); clusterIter != groups.end(); clusterIter++) {
      float distance = dist(now, clusterIter->second->centroid);
      if (distance < minDist) {
        minDist = distance;
        now->group = clusterIter->first;
      }
    }
    groups[now->group]->nodes.push_back(now);
  }

  //Compute new centroids
  bool hasUpdated = false;
  for (map<int, cluster*>::iterator it = groups.begin(); it != groups.end(); it++) {
    node *newCentroid = getCentroid(it->second);
    if (!(*(it->second->centroid) == *newCentroid)) {
      hasUpdated = true;
      delete it->second;
      it->second = new cluster(it->first, newCentroid);
    }
  }

  if (hasUpdated) {
    runKMeans(groups, grid);
  }
}

// -----------  Cluster ACO --------------

// -----------  Local ACO ----------------

// -----------  Main  --------------------
int main(int argc, char **argv) {
  string inputLine;
  map<int, node*> grid;
  while (getline(cin, inputLine)) {
    int name, x, y, z;
    sscanf(inputLine.c_str(), "%d %d %d %d", &name, &x, &y, &z);
    grid[name] = new node(name, x, y, z);
  }

  srand(time(NULL));
  // Grouping with K-means
  int K = int(ceil(sqrt(grid.size() / 2.f)));
  vector<int> initCentroids = generateRand(K, grid.size());
  map<int, cluster*> groups;
  for (int i = 0; i < initCentroids.size(); i++) {
    int idx = initCentroids[i];
    groups[i] = new cluster(i, new node(grid[idx]->name, grid[idx]->x, grid[idx]->y, grid[idx]->z));
  }
  runKMeans(groups, grid);

  // Connection between clusters
  // Find local path within clusters
  // Output global routing

  return 0;
}
