from z3 import *
import sys

f = open("../input/23.txt", "r")
raw = f.read().splitlines()


def distance(oneX, oneY, oneZ, twoX, twoY, twoZ):
    x = oneX-twoX
    y = oneY-twoY
    z = oneZ-twoZ
    d = z3.If(x >= 0, x, -x) + z3.If(y >= 0, y, -y) + z3.If(z >= 0, z, -z)
    return d


def inRange(oneX, oneY, oneZ, oneR, twoX, twoY, twoZ):
    d = distance(oneX, oneY, oneZ, twoX, twoY, twoZ)
    return d <= oneR


bots = []
for row in raw:
    row = row.replace("pos=<", "")
    parts = row.split(">,")
    pos = parts[0].split(",")
    x = int(pos[0])
    y = int(pos[1])
    z = int(pos[2])
    r = int(parts[1].split("=")[1])
    bots.append((x, y, z, r))


solver = z3.Optimize()

bestX = z3.Int('bestX')
bestY = z3.Int('bestY')
bestZ = z3.Int('bestZ')
dest = z3.Int('dest')

inside = []
for i, b in enumerate(bots):
    bot = z3.Int('b{:4d}'.format(i))
    ok = z3.If(inRange(b[0], b[1], b[2], b[3], bestX, bestY, bestZ), 1, 0)
    solver.add(bot == ok)
    inside.append(bot)


solver.add(dest == distance(bestX, bestY, bestZ, 0, 0, 0))

solver.maximize(z3.Sum(*inside))
solver.minimize(dest)
solver.check()

m = solver.model()
min_distance = m.eval(dest)
print(min_distance)
