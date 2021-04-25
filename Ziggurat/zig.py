import numpy as np
import matplotlib.pyplot as plt
from scipy.stats import norm
from scipy import optimize

def f(x):
	return np.exp(-0.5*x**2)

def f_inv(y):
	return np.sqrt(-2.0*np.log(y))

def normal_tail(x):
	return norm.cdf(-x)*np.sqrt(2*np.pi)

def zig(x, n, func, inv_func, tail):
	y = func(x)
	v = y*x + tail

	res = [(x,y)]
	for i in range(n):
		y = v/x + func(x)
		x = inv_func(y)
		res.append((x,y))

	return res

def zig_optim(x, n, func, inv_func, tail):
	y = func(x)
	v = y*x + tail(x)
	print (x)

	for i in range(n-1):
		y = v/x + func(x)
		x = inv_func(y)

	return v-x+x*y

x = np.linspace(0, 5, 1000)

r = 2.3
n = 3

xs = []
for x_ in x:
	xs.append(zig_optim(x_, n, f, f_inv, normal_tail))

plt.figure()
ax = plt.subplot(111)
ax.plot(x, xs)

root = optimize.newton(zig_optim, x0=r, args=(n, f, f_inv, normal_tail), maxiter=1000, tol=1e-9)
print ("Result", root, 1/root)
r = root

zig_point = zig(r, n, f, f_inv, normal_tail(r))

plt.figure()
ax = plt.subplot(111)
ax.plot(x, f(x))
ax.set_xlim(0, None)
ax.set_ylim(0, None)

for x,y in zig_point:
	print ("{x:",x,", y:",y,"},")

	ax.plot([0, x], [y, y], "k")
	ax.plot([x, x], [0, y], "k", ls="--")

plt.show()
