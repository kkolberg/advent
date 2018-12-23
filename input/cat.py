import exrex
pat='^ENWWW(NEEE|SSE(EE|N))$'

one=exrex.getone(pat)
print(one)