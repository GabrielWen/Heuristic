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

  bool operator==(const node &a)const {
    return abs(a.x - x) < 0.00001 && abs(a.y - y) < 0.00001 && abs(a.z - z) < 0.00001;
  }

  node(int n, float a, float b, float c): name(n), x(a), y(b), z(c), group(-1) {};
};

struct cluster {
  node *centroid;
  vector<node*> nodes;
  int name;
  int startIdx; //The node connecting to previous cluster, must be the start of routing
  int endIdx; //The node connecting to next cluster, must be the end of routing

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

// -----------  ACO --------------
float getProb(float pheromone, node *a, node *b) {
  float distAB = dist(a, b);
  return pow(pheromone, alpha) * pow(1/distAB, beta);
}

float newPhe(float pheromone, float added) {
  return (1.f - P) * pheromone + added;
}

float routeDist(vector<node*> route) {
  float total =  0.f;
  for (int i = 1; i < route.size(); i++) {
    total += dist(route[i-1], route[i]);
  }

  return total + dist(route[0], route[route.size()-1]);
}

bool choicesComp(pair<float, int> a, pair<float, int> b) {
  return a.first < b.first;
}

int pickNextIdx(set<int> availables, map<pair<int, int>, float> phe, cluster *c, int startIdx) {
  vector<pair<float, int> > choices;
  float totalProb = 0.f;
  for (set<int>::iterator it = availables.begin(); it != availables.end(); it++) {
    pair<int, int> edge(min(c->nodes[startIdx]->name, c->nodes[*it]->name), max(c->nodes[startIdx]->name, c->nodes[*it]->name));

    float newProb = getProb(phe[edge], c->nodes[startIdx], c->nodes[*it]);
    choices.push_back(make_pair(newProb, *it));
    totalProb += newProb;
  }

  for (int i = 0; i < choices.size(); i++) {
    choices[i] = make_pair(choices[i].first / totalProb, choices[i].second);
  }
  sort(choices.begin(), choices.end(), choicesComp);

  float randPick = (rand() % 100) / 100.f;

  for (int i = 0; i < choices.size(); i++) {
    if (randPick < choices[i].first) {
      return choices[i].second;
    }
    randPick -= choices[i].first;
  }

  return choices[choices.size()-1].second;
}

// For global routing, there's no pre-defined start point and end point
vector<node*> globalScheduleRoute(cluster *c, map<pair<int, int>, float> pheromones) {
  int startIdx = rand() % c->nodes.size();
  set<int> availables;
  vector<node*> route;
  for (int n = 0; n < c->nodes.size(); n++) {
    if (n != startIdx) {
      availables.insert(n);
    }
  }

  while (availables.size()) {
    int nextIdx = pickNextIdx(availables, pheromones, c, startIdx);
    availables.erase(nextIdx);
    route.push_back(c->nodes[nextIdx]);
    startIdx = nextIdx;
  }

  return route;
}

// For local routing, there has pre-defined start point and end point
vector<node*> localScheduleRoute(cluster *c, map<pair<int, int>, float> pheromones) {
  vector<node*> route;

  return route;
}

void updatePheromones(vector<node*> route, map<pair<int, int>, float> &phe, float distance) {
  float p = 1.f;
  set<pair<int, int> > edges;

  for (int i = 1; i < route.size(); i++) {
    pair<int, int> edge(min(route[i-1]->name, route[i]->name), max(route[i-1]->name, route[i]->name));
    edges.insert(edge);
  }
  pair<int, int> edge(min(route[0]->name, route[route.size()-1]->name), max(route[0]->name, route[route.size()-1]->name));
  edges.insert(edge);

  for (map<pair<int, int>, float>::iterator it = phe.begin(); it != phe.end(); it++) {
    if (edges.count(it->first)) {
      //In current route
      it->second = newPhe(it->second, Q / distance);
    } else {
      //Not in current route
      it->second = newPhe(it->second, 0);
    }
  }
}

void printRoute(vector<node*> route) {
  for (int i = 1; i < route.size(); i++) {
    printf("%d -> %d\n", route[i-1]->name, route[i]->name);
  }
}

vector<node*> antColonyAlgo(cluster *c, vector<node*> (*routeFunc)(cluster*, map<pair<int, int>, float>)) {
  map<pair<int, int>, float> pheromones;
  for (int u = 0; u < c->nodes.size(); u++) {
    for (int v = u+1; v < c->nodes.size(); v++) {
      pair<int, int> edge = make_pair(min(c->nodes[u]->name, c->nodes[v]->name), max(c->nodes[u]->name, c->nodes[v]->name));
      pheromones[edge] = initPhe;
    }
  }

  float bestDistance = FLT_MAX;
  vector<node*> bestRoute;
  for (int ant = 0; ant < numAnts; ant++) {
    vector<node*> newRoute = routeFunc(c, pheromones);
    float distance = routeDist(newRoute);
    updatePheromones(newRoute, pheromones, distance);

    if (distance < bestDistance) {
      bestDistance = distance;
      bestRoute = newRoute;
    }
  }

  return bestRoute;
}

// ----------- Cluster connection --------
// connect a -> b
void connect(cluster *a, cluster *b) {
  //Find b's startIdx
  float minDist = FLT_MAX;
  for (int i = 0; i < b->nodes.size(); i++) {
    float distance = dist(a->centroid, b->nodes[i]);
    if (distance < minDist) {
      minDist = distance;
      b->startIdx = i;
    }
  }
  //Find a's endIdx
  minDist = FLT_MAX;
  for (int i = 0; i < a->nodes.size(); i++) {
    float distance = dist(a->nodes[i], b->centroid);
    if (distance < minDist) {
      minDist = distance;
      a->endIdx = i;
    }
  }
}

void clusterConnection(map<int, cluster*> &groups, vector<node*> route) {
  for (int i = 1; i < route.size(); i++) {
    connect(groups[route[i-1]->name], groups[route[i]->name]);
  }
  connect(groups[route[route.size()-1]->name], groups[route[0]->name]);
}

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
  cluster *global = new cluster(-1, new node(-1, 0, 0, 0));
  for (map<int, cluster*>::iterator it = groups.begin(); it != groups.end(); it++) {
    global->nodes.push_back(it->second->centroid);
  }
  vector<node*> globalRoute = antColonyAlgo(global, globalScheduleRoute);
  clusterConnection(groups, globalRoute);
  // Find local path within clusters
  // Output global routing

  return 0;
}
