#!/bin/bash

#Check if we are in the developing branch
currentBranch=$(git rev-parse --abbrev-ref HEAD)

echo "CurrentBranch: $currentBranch"

if [ -z "$PNP_DEVBRANCH" ]; then
    PNP_DEVBRANCH=$currentBranch
fi

echo "SetupDevBranch: $PNP_DEVBRANCH"
echo "SetupProdBranch: $PNP_PRODBRANCH"
echo "BuidCommand: $PNP_BUILDCOMMAND"
echo "BumpMode: $1"

#If we are not in DEVBRANCH, we need to switch to it
if [ -n "$currentBranch" -a "$currentBranch" != "$PNP_DEVBRANCH" ]; then
	echo "switch back to $PNP_DEVBRANCH branch..."
	git checkout $PNP_DEVBRANCH
	echo "get actual code from $PNP_DEVBRANCH branch..."
	git pull
fi

if [ -n "$PNP_PRODBRANCH" ]; then
    echo "pull changes from $PNP_PRODBRANCH"
    git pull origin $PNP_PRODBRANCH
fi

#build in DEVBRANCH
echo "do build in $PNP_DEVBRANCH"
$PNP_BUILDCOMMAND

#Test if we hav any difference between local and origin
if [[ $(git diff --name-status $PNP_DEVBRANCH) ]]; then
    echo "differences origin $PNP_DEVBRANCH and local $PNP_DEVBRANCH"
    echo "commit in $PNP_DEVBRANCH"
    git add *
    git commit -m 'build dist'
    git push
else
    echo "no differences between origin $PNP_DEVBRANCH and local $PNP_DEVBRANCH found"
fi

if [ -n "$PNP_PRODBRANCH" ]; then

    #Test if we hav any difference between DEVBRANCH and PRODBRANCH
    if [[ $(git diff --name-status $PNP_PRODBRANCH..$PNP_DEVBRANCH) ]]; then
        echo "differences between $PNP_DEVBRANCH and $PNP_PRODBRANCH found"
    else
        echo "no differences between $PNP_DEVBRANCH and $PNP_PRODBRANCH found"
        exit 0;
    fi

    #Switch to PRODBRANCH
    echo "switch to $PNP_PRODBRANCH branch..."
    git checkout $PNP_PRODBRANCH

    #Merge DEVBRANCH into PRODBRANCH
    echo "merge $PNP_DEVBRANCH into $PNP_PRODBRANCH branch..."
    git merge $PNP_DEVBRANCH

fi

#Then we bump the version in the DEVBRANCHing branch
if [ -n "$1" -a "$1" = "major" ]; then
	echo "Bump major version number in $PNP_DEVBRANCH (x).x.x!"
    npm version major -m "Bumped (via major) to version:%s"
elif [ -n "$1" -a "$1" = "minor" ]; then
	echo "Bump minor version number in $PNP_DEVBRANCH x.(x).x!"
	npm version minor -m "Bumped (via minor) to version:%s"
elif [ -z "$1" -o "$1" = "patch" ]; then
	echo "Bump patch version number in $PNP_DEVBRANCH x.x.(x)!"
	npm version patch -m "Bumped (via patch) to version:%s"
else
	echo "Bump $1 version number in $PNP_DEVBRANCH!"
	npm version $1 -m "Bumped (via $1) to version:%s"
fi

echo "push new package.json with tag"
git push --tags
git push

echo "Publish to npm registry"
npm publish

if [ -n "$PNP_PRODBRANCH" ]; then
    #Switch to DEVBRANCH
    echo "switch back to $PNP_DEVBRANCH branch..."
    git checkout $PNP_DEVBRANCH

    #Merge PRODBRANCH into DEVBRANCH
    echo "merge $PNP_PRODBRANCH into $PNP_DEVBRANCH branch..."
    git merge $PNP_PRODBRANCH
    git push
fi

exit 0;
