#include <iostream>
#include <vector>
#include <string>
#include <map>
#include <math.h>
#include <pthread.h>
#include <stdlib.h>

using namespace std;

struct node {
  int x;
  int y;
  int z;
  int group;

  node(int a, int b, int c): x(a), y(b), z(c), group(-1) {};
};

int main(int argc, char **argv) {

  string inputLine;
  map<int, node*> grid;
  while (getline(cin, inputLine)) {
    int name, x, y, z;
    sscanf(inputLine.c_str(), "%d %d %d %d", &name, &x, &y, &z);
    grid[name] = new node(x, y, z);
  }

  //Step 1: Node clustering
  //Step 2: cluster optimal path finding
  //Step 3: Cluster connection

  return 0;
}
