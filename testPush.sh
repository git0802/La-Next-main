#!/bin/bash

# Navigate to the directory from where the script is called
cd "$PWD"

# Run the tests
npm test -- --forceExit

# If the tests are successful, continue to build
if [ $? -eq 0 ]; then
    npm run build
    # If the build is successful, continue to add, commit, and push
    if [ $? -eq 0 ]; then
        git add .
        git commit -m "$1"
        git push origin main
    else
        echo "Build failed! Fix the errors before pushing."
    fi
else
    echo "Tests failed! Fix the tests before pushing."
fi
