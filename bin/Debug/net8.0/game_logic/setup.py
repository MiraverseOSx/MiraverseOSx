from setuptools import setup, Extension
import sys

try:
    from Cython.Build import cythonize
    USE_CYTHON = True
except ImportError:
    USE_CYTHON = False

ext_modules = []
if USE_CYTHON:
    ext_modules = cythonize([
        Extension("ecosystem_engine_cy", ["game_logic/ecosystem_engine.pyx"]),
        Extension("harmony_math_cy", ["game_logic/harmony_math.pyx"]),
    ], compiler_directives={'language_level': "3"})

setup(
    name="miraverse_game_logic_cy",
    ext_modules=ext_modules,
)
