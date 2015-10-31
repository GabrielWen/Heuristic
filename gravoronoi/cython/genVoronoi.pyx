import numpy as np
cimport numpy as np
cimport cython

cdef int colors_index[1000][1000]
cdef float pulls[50]
cdef float cache[1000][1000]
cdef int colors_internal[50][3]
cdef int points_internal[50][200][2]

@cython.cdivision(True)
@cython.boundscheck(False)
@cython.wraparound(False)
cpdef init_cache():
    cdef int i, j
    cdef float d
    for i in range(1000):
        for j in range(1000):
            d = i*i + j*j
            if (i == 0 and j == 0):
                cache[i][j] = 1000.0
            else:
                cache[i][j] = 1.0/d
            colors_index[i][j] = -1

@cython.boundscheck(False)
@cython.wraparound(False)
cdef int max_index(int n_players):
    cdef int i
    cdef int max_index = 0
    cdef float max_val = 0
    for i in range(n_players):
        if max_val < pulls[i]:
            max_val = pulls[i]
            max_index = i
    return max_index

@cython.boundscheck(False)
@cython.wraparound(False)
cpdef generate_voronoi_diagram(
    int n_players, int n_moves,
    np.ndarray[np.int_t, ndim=3] points,
    np.ndarray[np.uint8_t, ndim=2] colors,
    np.ndarray[np.uint8_t, ndim=3] image,
    int GUIOn,
    int scale
):
    cdef int px, py, a, b, x, y, p, m, i, max_i, j, k
    for i in range(n_players):
        for j in range(3):
            colors_internal[i][j] = colors[i,j]
    for i in range(n_players):
        for j in range(n_moves):
            for k in range(2):
                points_internal[i][j][k] = points[i,j,k]
    for x in range(1000):
        for y in range(1000):
            for i in range(n_players):
                pulls[i] = 0.0
            for p in range(n_players):
                for m in range(n_moves):
                    if points_internal[p][m][0] == -1:
                        break
                    px = points_internal[p][m][0]
                    if px > x:
                        a = px - x
                    else:
                        a = x - px
                    py = points_internal[p][m][1]
                    if py > y:
                        b = py - y
                    else:
                        b = y - py
                    pulls[p] += cache[a][b]
            max_i = max_index(n_players)
            colors_index[x][y] = max_i
    if GUIOn:
        for x in range(0, 1000, scale):
            for y in range(0, 1000, scale):
                image[y/scale,x/scale,0] = colors_internal[colors_index[x][y]][0]
                image[y/scale,x/scale,1] = colors_internal[colors_index[x][y]][1]
                image[y/scale,x/scale,2] = colors_internal[colors_index[x][y]][2]

@cython.boundscheck(False)
@cython.wraparound(False)
cpdef get_pulls(int n_players, int n_moves, np.ndarray[np.int_t, ndim=3] points, int playerIdx):
  cdef int px, py, a, b, x, y, p, m, i, max_i, j, k
  for i in range(n_players):
    for j in range(n_moves):
      for k in range(2):
        points_internal[i][j][k] = points[i,j,k]

  cdef float myPulls, oppPulls
  myPulls = 0.0
  oppPulls = 0.0
  for x in range(1000):
    for y in range(1000):
      for i in range(n_players):
        pulls[i] = 0.0
      for p in range(n_players):
        for m in range(n_moves):
          if points_internal[p][m][0] == -1:
            break
          px = points_internal[p][m][0]
          if px > x:
            a = px - x
          else:
            a = x - px
          py = points_internal[p][m][1]
          if py > y:
            b = py - y
          else:
            b = y - py
          pulls[p] += cache[a][b]
        if p == playerIdx:
          myPulls += pulls[p]
        else:
          oppPulls += pulls[p]
  return myPulls - oppPulls

@cython.boundscheck(False)
@cython.wraparound(False)
cpdef get_scores(int n_players):
    cdef np.ndarray[np.int_t, ndim=1] scores_external = np.zeros([n_players], dtype=np.int)
    for x in range(1000):
        for y in range(1000):
            scores_external[colors_index[x][y]] += 1
    return scores_external

@cython.boundscheck(False)
@cython.wraparound(False)
cpdef get_color_indices_and_scores(
    int n_players,
    int n_moves,
    np.ndarray[np.int_t, ndim=3] points
):
    cdef np.ndarray[np.int_t, ndim=1] scores_external = np.zeros([n_players], dtype=np.int)
    cdef np.ndarray[np.int_t, ndim=2] colors_index_external = np.zeros([1000, 1000], dtype=np.int)
    for x in range(1000):
        for y in range(1000):
            colors_index_external[x, y] = colors_index[x][y]
            scores_external[colors_index[x][y]] += 1
    return scores_external, colors_index_external
