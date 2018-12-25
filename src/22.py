import sys
import networkx as networkx

f = open("../input/Cave.txt", "r")
raw = f.read().splitlines()
spots = []
endX = 12
endY = 763
for r in raw:
    r = r.strip()
    if(len(r) > 0):
        spots.append(list(r))


def tools(t):
    if t == ".":
        return {1, 2}
    if t == "=":
        return {0, 1}
    if t == "|":
        return {0, 2}
    return {}


G = networkx.DiGraph()
for y in range(len(spots)):
    for x in range(len(spots[0])):
        blah = tools(spots[y][x])
        for t in blah:
            for z in blah:
                if t != z:
                    G.add_edge((x, y, t), (x, y, z), weight=7)
print("height: "+str(len(spots))+"  width: "+str(len(spots[0])))


def options(x, y):
    return [(x, y-1), (x, y+1), (x-1, y), (x+1, y)]


for y in range(len(spots)):
    for x in range(len(spots[0])):

        for n in options(x, y):
            nx = n[0]
            ny = n[1]
            if ny < 0 or ny >= len(spots):
                if x == endX and y == endY:
                    print("y exit")
                continue
            if nx < 0 or nx >= len(spots[0]):
                if x == endX and y == endY:
                    print("x exit "+str(nx)+","+str(ny) +
                          "   "+str(len(spots[0])))
                continue
            t = tools(spots[y][x])
            nt = tools(spots[ny][nx])
            valids = t.intersection(nt)

            for to in valids:
                if x == endX and y == endY:
                    print("found")
                G.add_edge((x, y, to), (nx, ny, to), weight=1)


time = networkx.dijkstra_path_length(G, (0, 0, 2), (endX, endY, 2))
print(time)
