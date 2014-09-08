mded
===

The first intuitive markdown editor

# For Users

## Installation

mded is built using Node.js, and thus requires you to have `node` and `npm` installed. If you don't, go do that, then come back here.

```
sudo npm install -g mded
```

## It is telling me to run a patch?

mded uses node-webkit for a gui. This poses a few problems on new linux distributions, such as Debian jessie/sid, as node-webkit was compiled against libudev0 and the most recent version is libudev1. We have bundled a patching utility with mded. When you first run mded, it is going to attempt to start node-webkit. If it fails, due to the libudev version bump, it will give you some simple instructions to run the libudev patch. It is a simple one liner that will fix everything for you. *IMPORTANT* only run the patch if promted by mded. If you run the patch on a system that uses libudev0, it will ruin your mded installation.

# For Developers

## Installation

```
git checkout git@github.com:wblankenship/mded.git
cd mded
sudo npm link
```

This will install your local version as a command line util. Whenever you make changes to the codebase, re-run `npm link`.
