#!/bin/bash

#Check if we are in the developing branch
currentBranch=$(git rev-parse --abbrev-ref HEAD)

echo "CurrentBranch: $currentBranch"
echo "SetupDevBranch: $PNP_DEVBRANCH"
echo "SetupProdBranch: $PNP_PRODBRANCH"
echo "BuidCommand: $PNP_BUILDCOMMAND"

#If we are not in develop, we need to switch to it
if [ -n "$currentBranch" -a "$currentBranch" != "$PNP_DEVBRANCH" ]; then
	echo "switch back to $PNP_DEVBRANCH branch..."
	git checkout $PNP_DEVBRANCH
	echo "get actual code from $PNP_DEVBRANCH branch..."
	git pull
fi

echo "pull changes from master"
git pull origin $PNP_PRODBRANCH

#build in develop
echo "do build in develop"
$PNP_BUILDCOMMAND

#Test if we hav any difference between develop and master
if [[ $(git diff --name-status $PNP_DEVBRANCH) ]]; then
    echo "differences origin develop and local"
    echo "commit in develop"
    git add *
    git commit -m 'build dist'
    git push
else
    echo "no differences between develop and master found"
fi

#Test if we hav any difference between develop and master
if [[ $(git diff --name-status $PNP_PRODBRANCH..$PNP_DEVBRANCH) ]]; then
    echo "differences between develop and master found"
else
    echo "no differences between develop and master found"
    exit 0; 
fi

#Switch to master
echo "switch to master branch..."
git checkout $PNP_PRODBRANCH

#Merge develop into master
echo "merge develop into master branch..."
git merge $PNP_DEVBRANCH

#Then we bump the version in the developing branch
if [ -n "$1" -a "$1" = "major" ]; then
	echo "Bump major version number in release (x).x.x!"
	npm version major -m "Bumped (via major) to version:%s"
elif [ -n "$1" -a "$1" = "minor" ]; then
	echo "Bump minor version number in release x.(x).x!"
	npm version minor -m "Bumped (via minor) to version:%s"
else
	echo "Bump patch version number in develop x.x.(x)!"
	npm version patch -m "Bumped (via patch) to version:%s"
fi

echo "push new package.json with tag into master"
git push --tags
git push

echo "Publish to npm registry"
npm publish

#Switch to develop
echo "switch back to develop branch..."
git checkout $PNP_DEVBRANCH

#Merge master into develop
echo "merge master into develop branch..."
git merge $PNP_PRODBRANCH
git push

exit 0;
