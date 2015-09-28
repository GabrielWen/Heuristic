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
  struct node *connect;

  bool operator==(const node &a)const {
    return abs(a.x - x) < 0.00001 && abs(a.y - y) < 0.00001 && abs(a.z - z) < 0.00001;
  }

  node(int n, float a, float b, float c): name(n), x(a), y(b), z(c), group(-1) {};
};

struct cluster {
  node *centroid;
  vector<node*> nodes;

  cluster(node *c): centroid(c) {};
};

//------- Kmeans functions declarations ---------------

set<int> generateRand(int num, size_t size) {
  set<int> ret;
  srand(time(NULL));

  while (ret.size() < num) {
    int a = (rand() % size) + 1;
    ret.insert(a);
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

  return new node(0, xSum / c->nodes.size(), ySum / c->nodes.size(), zSum / c->nodes.size());
}

float dist(node *a, node *b) {
  return sqrt(pow(a->x - b->x, 2) + pow(a->y - b->y, 2) + pow(a->z - b->z, 2));
}

void runKMeans(map<int, cluster*> &groups, map<int, node*> &grid) {
  //Initialize groups
  for (map<int, cluster*>::iterator it = groups.begin(); it != groups.end(); it++) {
    cluster *prev = it->second;
    it->second = new cluster(prev->centroid);
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
      it->second = new cluster(newCentroid);
    }
  }

  //Check ending condition
  if (hasUpdated) {
    runKMeans(groups, grid);
  }
}

// -------Ant Colony Algorithm -------
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
    unsigned t1 = clock();
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

vector<node*> scheduleRoute(cluster *c, map<pair<int, int>, float> pheromones) {
  int startIdx = rand() % c->nodes.size();
  set<int> availables;
  vector<node*> route;
  route.push_back(c->nodes[startIdx]);
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
    printf("(%.2f, %.2f, %.2f) -> (%.2f, %.2f, %.2f)\n", route[i-1]->x, route[i-1]->y, route[i-1]->z,
                                                         route[i]->x, route[i]->y, route[i]->z);
  }
}

float antColonyAlgo(cluster *c) {
  //int numAnts = c->nodes.size();
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
    vector<node*> newRoute = scheduleRoute(c, pheromones);
    float distance = routeDist(newRoute);
    updatePheromones(newRoute, pheromones, distance);

    if (distance < bestDistance) {
      bestDistance = distance;
      bestRoute = newRoute;
    }
  }

  //Connect nodes
  for (int i = 1; i < bestRoute.size(); i++) {
    bestRoute[i]->prev = bestRoute[i-1];
    bestRoute[i-1]->next = bestRoute[i];
  }
  bestRoute[bestRoute.size()-1]->next = bestRoute[0];
  bestRoute[0]->prev = bestRoute[bestRoute.size()-1];
  node *stop = bestRoute[0], *ptr = bestRoute[1];

  return bestDistance - dist(bestRoute[0], bestRoute[bestRoute.size()-1]);
}

// ------Cluster connection -----------
pair<node*, node*> pickConnectNode(cluster* c, node *n) {
  node *ret = NULL;
  float minDist = FLT_MAX;
  for (int i = 0; i < c->nodes.size(); i++) {
    float distance = dist(c->nodes[i], n);
    if (distance < minDist) {
      minDist = distance;
      ret = c->nodes[i];
    }
  }

  //Cut longer neighbor
  node *end = NULL;
  if (dist(ret, ret->prev) < dist(ret, ret->next)) {
    //Cut next
    end = ret->next;
    ret->next->prev = NULL;
    ret->next = NULL;
  } else {
    //Cut prev
    end = ret->prev;
    ret->prev->next = NULL;
    ret->prev = NULL;
  }
  
  //Return: a pair of node, first is connecting node, second is end node
  return make_pair(ret, end);
}

void connectTwoNodes(node *a, node *b) {
  a->connect = b;
  b->connect = a;
}

vector<node*> generateRoute(node *start, node *end) {
  node *ptr = start;
  vector<node*> route;
  while (ptr != NULL) {
    node *local = ptr;
    route.push_back(ptr);
    if (ptr->prev) {
      while (ptr->prev) {
        route.push_back(ptr->prev);
        ptr = ptr->prev;
      }
    } else {
      while (ptr->next) {
        route.push_back(ptr->next);
        ptr = ptr->next;
      }
    }
    ptr = ptr->connect;
  }

  //Cut longest path
  float maxDist = dist(route[0], route[route.size()-1]);
  pair<int, int> cut = make_pair(0, route.size()-1);
  bool updated = false;
  for (int i = 1; i < route.size(); i++) {
    float distance = dist(route[i-1], route[i]);
    if (distance < maxDist) {
      maxDist = distance;
      cut = make_pair(i-1, i);
      updated = true;
    }
  }
  if (updated) {
    vector<node*> newResult;
    for (int i = cut.second; i < route.size(); i++) {
      newResult.push_back(route[i]);
    }
    for (int i = 0; i <= cut.first; i++) {
      newResult.push_back(route[i]);
    }
    return newResult;
  }

  return route;
}

vector<node*> clusterConnect(map<int, cluster*> groups) {
  vector<node*> final;
  //Connect first two clusters
  pair<int, int> first;
  set<int> visited;
  float minDist = FLT_MAX;
  int a, b;
  for (a = 0; a < groups.size(); a++) {
    for (b = a+1; b < groups.size(); b++) {
      float distance = dist(groups[a]->centroid, groups[b]->centroid);
      if (distance < minDist) {
        minDist = distance;
        first = make_pair(a, b);
      }
    }
  }
  visited.insert(first.first);
  visited.insert(first.second);
  pair<node*, node*> pickedNode1 = pickConnectNode(groups[first.first], groups[first.second]->centroid);
  pair<node*, node*> pickedNode2 = pickConnectNode(groups[first.second], groups[first.first]->centroid);
  connectTwoNodes(pickedNode1.first, pickedNode2.first);
  node *endNode1 = pickedNode1.second, *endNode2 = pickedNode2.second;

  //Connect all others
  while (visited.size() < groups.size()) {
    int nextIdx = -1;
    float minDist = FLT_MAX;
    for (int i = 0; i < groups.size(); i++) {
      if (visited.count(i)) {
        continue;
      }
      float dist1 = dist(endNode1, groups[i]->centroid), dist2 = dist(endNode2, groups[i]->centroid);
      if (minDist < min(dist1, dist2)) {
        continue;
      }
      nextIdx = i;
      minDist = min(dist1, dist2);
    }
    visited.insert(nextIdx);

    pair<node*, node*> nextPair;
    if (dist(endNode1, groups[nextIdx]->centroid) < dist(endNode2, groups[nextIdx]->centroid)) {
      nextPair = pickConnectNode(groups[nextIdx], endNode1);
      connectTwoNodes(endNode1, nextPair.first);
      endNode1 = nextPair.second;
    } else {
      nextPair = pickConnectNode(groups[nextIdx], endNode2);
      connectTwoNodes(endNode2, nextPair.first);
      endNode2 = nextPair.second;
    }
  }

  final = generateRoute(endNode1, endNode2);

  return final;
}


// ----- Main --------
//XXX: K-Means + ACO
int main(void) {
  time_t t1 = time(NULL);

  string inputLine;
  map<int, node*> grid;
  while (getline(cin, inputLine)) {
    int name, x, y, z;
    sscanf(inputLine.c_str(), "%d %d %d %d", &name, &x, &y, &z);
    grid[name] = new node(name, x, y, z);
  }

  //Step1: Node clustering
  int K = int(ceil(sqrt(grid.size() / 2.f)));
  set<int> initCentroids = generateRand(K, grid.size());
  map<int, cluster*> groups;
  int count = 0;
  for (set<int>::iterator it = initCentroids.begin(); it != initCentroids.end(); it++) {
    groups[count++] = new cluster(new node(grid[*it]->name, grid[*it]->x, grid[*it]->y, grid[*it]->z));
  }
  runKMeans(groups, grid);

  //Step2: Cluster optimal path finding
  for (map<int, cluster*>::iterator it = groups.begin(); it != groups.end(); it++) {
    float r = antColonyAlgo(it->second);
  }
  
  //Step3: Cluster connection
  vector<node*> route = clusterConnect(groups);
  for (int i = 0; i < route.size(); i++) {
    cout << route[i]->name << " ";
  }
  cout << endl << routeDist(route) << endl;
  cout << "Time: " << difftime(time(NULL), t1) << endl;
  return 0;
}

/*
//XXX: Vanilla ACO
int main(void) {
  string inputLine;
  cluster *c = new cluster(new node(-1, -1, -1, -1));
  while (getline(cin, inputLine)) {
    int name, x, y, z;
    sscanf(inputLine.c_str(), "%d %d %d %d", &name, &x, &y, &z);
    c->nodes.push_back(new node(name, x, y, z));
  }

  float result = antColonyAlgo(c);
  printf("Result: %.2f\n", result);
  return 0;
}
*/
