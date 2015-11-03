from websocket import create_connection
import json

mainSocket = create_connection('ws://localhost:1990');
socketH = create_connection('ws://localhost:1991');

class Hunter(object):
  def __init__(self):
    self.prey = [230, 200]
    self.hunter = [0, 0]
    self.direction = [1, 1]
    self.hunter_direction = None
    self.time = 0
    self.cooldown = 0
    self.lastTimeBuiltWall = -1
    self.wall_string = ''
    self.grid = {}
    self.walls = []

  def long_dist(self):
    return max(abs(self.prey[0] - self.hunter[0]), abs(self.prey[1] - self.hunter[1]))

  def short_side(self):
    # Return direction of wall that should be built
    if abs(self.prey[0] - self.hunter[0]) > abs(self.prey[1], self.hunter[1]):
      return 'V'
    else:
      return 'H'

  def have_cooldown(self):
    return self.time - self.lastTimeBultWall < self.cooldown

  def prey_in_front(self):
    vector_h2p = self.prey[0] - self.hunter[0], self.prey[1] - self.hunter[1]
    return (vector_h2p[0] * self['direction'][0] > 0) and (vector_h2p[1] * self['direction'][1] > 0)

  def prey_area(self, walls):
    left, right, top, down = [], [], [], []
    def sorting(w):
      if w['direction'] == 'E' or w['direction'] == 'W':
        dist = w['position'][1] - self.prey[1]
        if dist > 0:
          top.append((dist, w))
        else:
          down.append((dist, w))
      else:
        dist = w['position'][0] - self.prey[0]
        if dist:
          right.append((dist, w))
        else:
          left.append((dist, w))
    map(sorting, walls)

    if len(left):
      left = sorted(left, key=lambda x: x[0])[-1]
    else:
      left = self.grid['left']
    if len(right):
      right = sorted(right, key=lambda x: x[0])[0]
    else:
      right = self.grid['right']
    if len(top):
      top = sorted(top, key=lambda x: x[0])[0]
    else:
      top = self.grid['top']
    if len(down):
      down = sorted(down, key=lambda x: x[0])[-1]
    else:
      down = self.grid['down']

    #TODO: Do we need to consider about connectness?
    return (top['position'][1] - down['position'][1]) * (right[0] - left[0])

  def wall_between(self):
    ret = True

    def check_wall(w):
      if w['direction'] == 'E' or w['direction'] == 'W':
        ret = ret and ((self.prey[1] < w['position'][1] < self.hunter[1]) or (self.hunter[1] < w['position'][1] < self.prey[1]))
      else:
        ret = ret and ((self.prey[0] < w['position'][0] < self.hunter[0]) or (self.hunter[0] < w['position'][0] < self.prey[0]))
    map(check_wall, self.walls)

    return ret

  def new_vertical_wall(self):
    pass

  def new_horizontal_wall(self):
    pass

  def remove_and_build_wall(self):
    # TODO: Do this when it's close enough
    wall = None
    for i in xrange(len(self.walls)):
      w = self.walls[i]
      if w['direction'] == 'E' or w['direction'] == 'W':
        if self.prey[1] < w['position'][1] < self.hunter[1] or self.hunter[1] < w['position'][1] < self.prey[1]:
          wall = w
          break
      else:
        if self.prey[0] < w['position'][0] < self.hunter[0] or self.hunter[0] < w['position'][0] < self.prey[0]:
          wall = w
          break
    cmd = {
      'command': 'BD',
      'wallIds': [wall]
    }
    del self.walls[wall]
    
    ver_area = self.prey_area(self.walls[:] + [self.new_vertical_wall()])
    hor_area = self.prey_area(self.walls[:] + [self.new_horizontal_wall()])
    cmd['wall'] = {'direction': ('V' if ver_area < hor_area or 'H')}

    return cmd

  def good_time_for_wall(self, in_front):
    if self.have_cooldown():
      return False

    if in_front:
      bound = (self.cooldown / 2 + 1) + self.cooldown
      return self.long_dist() <= bound
    else:
      # Return a wall if it can corner prey into a smaller area
      curr_area = self.prey_area(self.walls)
      ver_area = self.prey_area(self.walls[:] + [self.new_vertical_wall()])
      hor_area = self.prey_area(self.walls[:] + [self.new_horizontal_wall()])

      return min(curr_area, ver_area, hor_area) != curr_area
      

  def move_in_front(self):
    cmd = {'command': 'M'}

    if self.wall_between():
      cmd = self.remove_and_build_wall()
    else:
      if self.good_time_for_wall(True):
        cmd['command'] = 'B'
        cmd['wall'] = {'direction': self.short_side()}

    return cmd

  def move_in_back(self):
    '''
    1. If a wall can be built:
      Built a wall that minimize the area for prey to move
    2. Else:
      Nothing
    '''
    pass

  def make_move(self, cmd):
    self.walls = cmd['walls']
    self.hunter = cmd['hunter']
    self.prey = cmd['prey']
    self.time = cmd['time']

    if self.prey_in_front():
      return self.move_in_front()
    else:
      return self.move_in_back()


def main():
  hunter = Hunter()
  socketH.send(json.dumps({'command': 'M'}))

  gameover = False
  while gameover is False:
    cmd = json.loads(mainSocket.recv())
    gameover = cmd['gameover']
    if gameover is False:
      newMove = hunter.make_move(cmd)
      socketH.send(json.dumps(newMove))


if __name__ == '__main__':
  main()
